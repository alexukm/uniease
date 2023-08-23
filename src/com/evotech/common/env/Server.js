import UniEaseEnv from '../../../../../uniease-env.json'
export const Server = {
  server: {
    pro: {
      http_prefix: "https://unieaseapp.com",
      context_path: "/uniEase",
      request_url: "https://unieaseapp.com/uniEase",
    },
    test: {
      http_prefix: "http://35.197.128.231",
      context_path: "/uniEase",
      request_url: "http://35.197.128.231/uniEase",
    },
  },
  webSocket: {
    pro: {
      request_url: "wss://unieaseapp.com/uniEase/ws-sfc",
    },
    test: {
      request_url: "ws://35.197.128.231/uniEase/ws-sfc",
    },
  },
};


export const getServerRequestUrl = ()=>{
  const env = UniEaseEnv.env;
  switch (env) {
    case "pro":
      return Server.server.pro.request_url;
    case "test":
      return Server.server.test.request_url;
  }
}

export const getServerRequestUrlPrefix = ()=>{
  const env = UniEaseEnv.env;
  switch (env) {
    case "pro":
      return Server.server.pro.http_prefix;
    case "test":
      return Server.server.test.http_prefix;
  }
}
export const getSocketUrl = ()=>{
  const env = UniEaseEnv.env;
  switch (env) {
    case "pro":
      return Server.webSocket.pro.request_url;
    case "test":
      return Server.webSocket.test.request_url;
  }
}
