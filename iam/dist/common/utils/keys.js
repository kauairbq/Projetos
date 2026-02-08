"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadKey = loadKey;
const fs_1 = require("fs");
function loadKey(path) {
    if (!path)
        return "";
    return (0, fs_1.readFileSync)(path, "utf8");
}
//# sourceMappingURL=keys.js.map