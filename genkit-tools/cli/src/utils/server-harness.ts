/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { startServer } from '@genkit-ai/tools-common/server';
import { findProjectRoot, logger } from '@genkit-ai/tools-common/utils';
import fs from 'fs';
import { startManager } from './manager-utils';

const args = process.argv.slice(2);
const port = Number.parseInt(args[0]) || 4100;
redirectStdoutToFile(args[1]);

async function start() {
  const manager = await startManager(await findProjectRoot(), true);
  await startServer(manager, port);
}

function redirectStdoutToFile(logFile: string) {
  var myLogFileStream = fs.createWriteStream(logFile);

  var originalStdout = process.stdout.write;
  function writeStdout() {
    originalStdout.apply(process.stdout, arguments as any);
    myLogFileStream.write.apply(myLogFileStream, arguments as any);
  }

  process.stdout.write = writeStdout as any;
  process.stderr.write = process.stdout.write;
}

process.on('error', (error): void => {
  logger.error(`Error in tools process: ${error}`);
});
process.on('uncaughtException', (err, somethingelse) => {
  logger.error(`Uncaught error in tools process: ${err} ${somethingelse}`);
});
process.on('unhandledRejection', (reason, p) => {
  logger.error(`Unhandled rejection in tools process: ${reason}`);
});

start();
