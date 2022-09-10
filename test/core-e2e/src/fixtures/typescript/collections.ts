export default [
  {
    "id": "base",
    "routes": ["add-headers:enabled", "get-users:success", "get-user:success", "get-users-new:success", "get-books:success"]
  },
  {
    "id": "no-headers",
    "from": "base",
    "routes": ["add-headers:disabled"]
  },
  {
    "id": "user-real",
    "from": "base",
    "routes": ["get-user:real"]
  },
]
