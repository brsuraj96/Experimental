import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

interface QueuedRequest {
  key: string;
  url: string;
  method: "POST" | "PUT" | "PATCH";
  body: any;
  headers?: Record<string, string>;
}

const QUEUE_KEY = "api_request_queue";

export async function queueRequest(request: QueuedRequest) {
  const queue = await getQueue();
  queue.push(request);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<QueuedRequest[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function flushQueue() {
  const queue = await getQueue();
  const newQueue: QueuedRequest[] = [];
  for (const req of queue) {
    try {
      await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
      });
    } catch (e) {
      newQueue.push(req); // keep failed requests
    }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
}

export function setupQueueListener() {
  NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      flushQueue();
    }
  });
}

export async function apiRequest(
  url: string,
  method: "POST" | "PUT" | "PATCH",
  body: any,
  headers?: Record<string, string>
) {
  const netState = await NetInfo.fetch();
  if (netState.isConnected) {
    return fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });
  } else {
    await queueRequest({
      key: Date.now().toString(),
      url,
      method,
      body,
      headers,
    });
    return null;
  }
}
