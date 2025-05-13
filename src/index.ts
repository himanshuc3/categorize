// TODO: After countless efforts and time drain,
// had to switch to cjs, because esm and ts-node is
// a bitch.

// NOTE:
// 1. Nodejs - Good for i/o bound tasks
// 2. Anecdotes make it revolve around servers in node rather
// than server side scripting

'use strict';

import Controller from './helper/controller';

const controller = new Controller();

controller.parseArguments();
// controller.initiateSegregation();
