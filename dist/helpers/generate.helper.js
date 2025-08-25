"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = void 0;
const generateRandomString = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    if (!Number.isInteger(length) || length < 0) {
        throw new Error("`length` phải là số nguyên không âm.");
    }
    let result = "";
    const n = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * n));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
