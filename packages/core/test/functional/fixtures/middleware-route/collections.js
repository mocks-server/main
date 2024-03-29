/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

module.exports = [
  {
    id: "base",
    routes: ["tracer:enabled", "get-users:success", "get-user:1"],
  },
  {
    id: "user-2",
    from: "base",
    routes: ["get-user:2"],
  },
  {
    id: "user-real",
    from: "base",
    routes: ["get-user:real"],
  },
];
