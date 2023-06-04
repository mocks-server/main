/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { createServer } from "./CreateServer";

function handleError(error: Error) {
  console.error(`Error: ${error.message}`);
  console.log(error);
  process.exitCode = 1;
}

export async function start(): Promise<void> {
  try {
    const mocksServer = createServer({
      config: {
        readArguments: true,
        readEnvironment: true,
        readFile: true,
      },
      plugins: {
        inquirerCli: {
          enabled: true,
        },
      },
      files: {
        enabled: true,
      },
    });
    await mocksServer.start().catch(handleError);
  } catch (error) {
    handleError(error as Error);
  }
}
