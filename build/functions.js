"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLink = exports.onlyNumbers = exports.validate = exports.isAdmin = exports.isSuperAdmin = exports.downloadSticker = exports.downloadVideo = exports.downloadImage = exports.getRandomName = exports.isCommand = exports.extractCommandAndArgs = exports.extractDataFromWebMessage = exports.writeJSON = exports.readJSON = exports.getCommand = exports.getBotData = void 0;
const baileys_1 = require("@adiwajshing/baileys");
const fs_1 = __importDefault(require("fs"));
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const general_1 = require("./configurations/general");
const getBotData = (socket, webMessage) => {
    const { remoteJid } = webMessage.key;
    const sendText = (text) => __awaiter(void 0, void 0, void 0, function* () {
        return socket.sendMessage(remoteJid, {
            text: `${general_1.general.prefixEmoji} ${text}`,
        });
    });
    const sendImage = (pathOrBuffer, caption = "", isReply = true) => __awaiter(void 0, void 0, void 0, function* () {
        let options = {};
        if (isReply) {
            options = {
                quoted: webMessage,
            };
        }
        const image = pathOrBuffer instanceof Buffer
            ? pathOrBuffer
            : fs_1.default.readFileSync(pathOrBuffer);
        const params = caption
            ? {
                image,
                caption: `${general_1.general.prefixEmoji} ${caption}`,
            }
            : { image };
        return yield socket.sendMessage(remoteJid, params, options);
    });
    const sendSticker = (pathOrBuffer, isReply = true) => __awaiter(void 0, void 0, void 0, function* () {
        let options = {};
        if (isReply) {
            options = {
                quoted: webMessage,
            };
        }
        const sticker = pathOrBuffer instanceof Buffer
            ? pathOrBuffer
            : fs_1.default.readFileSync(pathOrBuffer);
        return yield socket.sendMessage(remoteJid, { sticker }, options);
    });
    const sendAudio = (pathOrBuffer, isReply = true, ptt = true) => __awaiter(void 0, void 0, void 0, function* () {
        let options = {};
        if (isReply) {
            options = {
                quoted: webMessage,
            };
        }
        const audio = pathOrBuffer instanceof Buffer
            ? pathOrBuffer
            : fs_1.default.readFileSync(pathOrBuffer);
        if (pathOrBuffer instanceof Buffer) {
            return yield socket.sendMessage(remoteJid, {
                audio,
                ptt,
                mimetype: "audio/mpeg",
            }, options);
        }
        options = Object.assign(Object.assign({}, options), { url: pathOrBuffer });
        return yield socket.sendMessage(remoteJid, {
            audio: { url: pathOrBuffer },
            ptt,
            mimetype: "audio/mpeg",
        }, options);
    });
    const reply = (text) => __awaiter(void 0, void 0, void 0, function* () {
        return socket.sendMessage(webMessage.key.remoteJid, { text: `${general_1.general.prefixEmoji} ${text}` }, { quoted: webMessage });
    });
    const { messageText, isImage, isVideo, isSticker, isAudio, isDocument, userJid, replyJid, } = (0, exports.extractDataFromWebMessage)(webMessage);
    const { command, args } = (0, exports.extractCommandAndArgs)(messageText);
    return {
        sendText,
        sendImage,
        sendSticker,
        sendAudio,
        reply,
        remoteJid,
        userJid,
        replyJid,
        socket,
        webMessage,
        command,
        args,
        isImage,
        isVideo,
        isSticker,
        isAudio,
        isDocument,
    };
};
exports.getBotData = getBotData;
const getCommand = (commandName) => {
    const pathCache = path_1.default.join(__dirname, "..", "cache", "commands.json");
    const pathCommands = path_1.default.join(__dirname, "commands");
    const cacheCommands = (0, exports.readJSON)(pathCache);
    if (!commandName)
        return;
    const cacheCommand = cacheCommands.find((name) => name === commandName);
    if (!cacheCommand) {
        const command = fs_1.default
            .readdirSync(pathCommands)
            .find((file) => file.includes(commandName));
        if (!command) {
            throw new Error(`❌ Comando não encontrado! Digite ${general_1.general.prefix}menu para ver todos os comandos disponíveis!`);
        }
        (0, exports.writeJSON)(pathCache, [...cacheCommands, commandName]);
        return require(`./commands/${command}`).default;
    }
    return require(`./commands/${cacheCommand}`).default;
};
exports.getCommand = getCommand;
const readJSON = (pathFile) => {
    // @ts-ignore
    return JSON.parse(fs_1.default.readFileSync(pathFile));
};
exports.readJSON = readJSON;
const writeJSON = (pathFile, data) => {
    fs_1.default.writeFileSync(pathFile, JSON.stringify(data));
};
exports.writeJSON = writeJSON;
const extractDataFromWebMessage = (message) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
    let remoteJid;
    let messageText;
    let isReply = false;
    let replyJid = null;
    let replyText = null;
    const { key: { remoteJid: jid, participant: tempUserJid }, } = message;
    if (jid) {
        remoteJid = jid;
    }
    if (message) {
        const extendedTextMessage = (_a = message.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage;
        const buttonTextMessage = (_b = message.message) === null || _b === void 0 ? void 0 : _b.buttonsResponseMessage;
        const listTextMessage = (_c = message.message) === null || _c === void 0 ? void 0 : _c.listResponseMessage;
        const type1 = (_d = message.message) === null || _d === void 0 ? void 0 : _d.conversation;
        const type2 = extendedTextMessage === null || extendedTextMessage === void 0 ? void 0 : extendedTextMessage.text;
        const type3 = (_f = (_e = message.message) === null || _e === void 0 ? void 0 : _e.imageMessage) === null || _f === void 0 ? void 0 : _f.caption;
        const type4 = buttonTextMessage === null || buttonTextMessage === void 0 ? void 0 : buttonTextMessage.selectedButtonId;
        const type5 = (_g = listTextMessage === null || listTextMessage === void 0 ? void 0 : listTextMessage.singleSelectReply) === null || _g === void 0 ? void 0 : _g.selectedRowId;
        const type6 = (_j = (_h = message === null || message === void 0 ? void 0 : message.message) === null || _h === void 0 ? void 0 : _h.videoMessage) === null || _j === void 0 ? void 0 : _j.caption;
        messageText = type1 || type2 || type3 || type4 || type5 || type6 || "";
        isReply =
            !!extendedTextMessage && !!((_k = extendedTextMessage.contextInfo) === null || _k === void 0 ? void 0 : _k.quotedMessage);
        replyJid =
            extendedTextMessage && ((_l = extendedTextMessage.contextInfo) === null || _l === void 0 ? void 0 : _l.participant)
                ? extendedTextMessage.contextInfo.participant
                : null;
        replyText = (_o = (_m = extendedTextMessage === null || extendedTextMessage === void 0 ? void 0 : extendedTextMessage.contextInfo) === null || _m === void 0 ? void 0 : _m.quotedMessage) === null || _o === void 0 ? void 0 : _o.conversation;
    }
    const userJid = tempUserJid === null || tempUserJid === void 0 ? void 0 : tempUserJid.replace(/:[0-9][0-9]|:[0-9]/g, "");
    const tempMessage = message === null || message === void 0 ? void 0 : message.message;
    const isImage = !!(tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.imageMessage) ||
        !!((_r = (_q = (_p = tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.extendedTextMessage) === null || _p === void 0 ? void 0 : _p.contextInfo) === null || _q === void 0 ? void 0 : _q.quotedMessage) === null || _r === void 0 ? void 0 : _r.imageMessage);
    const isVideo = !!(tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.videoMessage) ||
        !!((_u = (_t = (_s = tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.extendedTextMessage) === null || _s === void 0 ? void 0 : _s.contextInfo) === null || _t === void 0 ? void 0 : _t.quotedMessage) === null || _u === void 0 ? void 0 : _u.videoMessage);
    const isAudio = !!(tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.audioMessage) ||
        !!((_x = (_w = (_v = tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.extendedTextMessage) === null || _v === void 0 ? void 0 : _v.contextInfo) === null || _w === void 0 ? void 0 : _w.quotedMessage) === null || _x === void 0 ? void 0 : _x.audioMessage);
    const isSticker = !!(tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.stickerMessage) ||
        !!((_0 = (_z = (_y = tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.extendedTextMessage) === null || _y === void 0 ? void 0 : _y.contextInfo) === null || _z === void 0 ? void 0 : _z.quotedMessage) === null || _0 === void 0 ? void 0 : _0.stickerMessage);
    const isDocument = !!(tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.documentMessage) ||
        !!((_3 = (_2 = (_1 = tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.extendedTextMessage) === null || _1 === void 0 ? void 0 : _1.contextInfo) === null || _2 === void 0 ? void 0 : _2.quotedMessage) === null || _3 === void 0 ? void 0 : _3.documentMessage);
    let mentionedJid = "";
    let mentionedJidObject = (_5 = (_4 = tempMessage === null || tempMessage === void 0 ? void 0 : tempMessage.extendedTextMessage) === null || _4 === void 0 ? void 0 : _4.contextInfo) === null || _5 === void 0 ? void 0 : _5.mentionedJid;
    if (mentionedJidObject) {
        mentionedJid = mentionedJidObject[0];
    }
    return {
        userJid,
        remoteJid,
        messageText,
        isReply,
        replyJid,
        replyText,
        isAudio,
        isImage,
        isSticker,
        isVideo,
        isDocument,
        mentionedJid,
        webMessage: message,
    };
};
exports.extractDataFromWebMessage = extractDataFromWebMessage;
const extractCommandAndArgs = (message) => {
    if (!message)
        return { command: "", args: "" };
    const [command, ...tempArgs] = message.trim().split(" ");
    const args = tempArgs.reduce((acc, arg) => acc + " " + arg, "").trim();
    return { command, args };
};
exports.extractCommandAndArgs = extractCommandAndArgs;
const isCommand = (message) => message.length > 1 && message.startsWith(general_1.general.prefix);
exports.isCommand = isCommand;
const getRandomName = (extension) => {
    const fileName = Math.floor(Math.random() * 10000);
    if (!extension)
        return fileName.toString();
    return `${fileName}.${extension}`;
};
exports.getRandomName = getRandomName;
const downloadImage = (webMessage, fileName, folder = null, ...subFolders) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    var _b, _c, _d, _e, _f;
    const content = (((_b = webMessage === null || webMessage === void 0 ? void 0 : webMessage.message) === null || _b === void 0 ? void 0 : _b.imageMessage) ||
        ((_f = (_e = (_d = (_c = webMessage === null || webMessage === void 0 ? void 0 : webMessage.message) === null || _c === void 0 ? void 0 : _c.extendedTextMessage) === null || _d === void 0 ? void 0 : _d.contextInfo) === null || _e === void 0 ? void 0 : _e.quotedMessage) === null || _f === void 0 ? void 0 : _f.imageMessage));
    if (!content)
        return null;
    const stream = yield (0, baileys_1.downloadContentFromMessage)(content, "image");
    let buffer = Buffer.from([]);
    try {
        for (var stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), !stream_1_1.done;) {
            const chunk = stream_1_1.value;
            buffer = Buffer.concat([buffer, chunk]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (stream_1_1 && !stream_1_1.done && (_a = stream_1.return)) yield _a.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    let directory = [__dirname, "..", "assets"];
    if (!folder) {
        directory = [...directory, "temp"];
    }
    if (folder) {
        directory = [...directory, folder];
    }
    if (subFolders.length) {
        directory = [...directory, ...subFolders];
    }
    const filePath = path_1.default.resolve(...directory, `${fileName}.jpg`);
    yield (0, promises_1.writeFile)(filePath, buffer);
    return filePath;
});
exports.downloadImage = downloadImage;
const downloadVideo = (webMessage, fileName, folder = null, ...subFolders) => __awaiter(void 0, void 0, void 0, function* () {
    var e_2, _g;
    var _h, _j, _k, _l, _m;
    const content = (((_h = webMessage === null || webMessage === void 0 ? void 0 : webMessage.message) === null || _h === void 0 ? void 0 : _h.videoMessage) ||
        ((_m = (_l = (_k = (_j = webMessage === null || webMessage === void 0 ? void 0 : webMessage.message) === null || _j === void 0 ? void 0 : _j.extendedTextMessage) === null || _k === void 0 ? void 0 : _k.contextInfo) === null || _l === void 0 ? void 0 : _l.quotedMessage) === null || _m === void 0 ? void 0 : _m.videoMessage));
    if (!content)
        return null;
    const stream = yield (0, baileys_1.downloadContentFromMessage)(content, "video");
    let buffer = Buffer.from([]);
    try {
        for (var stream_2 = __asyncValues(stream), stream_2_1; stream_2_1 = yield stream_2.next(), !stream_2_1.done;) {
            const chunk = stream_2_1.value;
            buffer = Buffer.concat([buffer, chunk]);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (stream_2_1 && !stream_2_1.done && (_g = stream_2.return)) yield _g.call(stream_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    let directory = [__dirname, "..", "assets"];
    if (!folder) {
        directory = [...directory, "temp"];
    }
    if (folder) {
        directory = [...directory, folder];
    }
    if (subFolders.length) {
        directory = [...directory, ...subFolders];
    }
    const filePath = path_1.default.resolve(...directory, `${fileName}.mp4`);
    yield (0, promises_1.writeFile)(filePath, buffer);
    return filePath;
});
exports.downloadVideo = downloadVideo;
const downloadSticker = (webMessage, fileName, folder = null, ...subFolders) => __awaiter(void 0, void 0, void 0, function* () {
    var e_3, _o;
    var _p, _q, _r, _s, _t;
    const content = (((_p = webMessage === null || webMessage === void 0 ? void 0 : webMessage.message) === null || _p === void 0 ? void 0 : _p.stickerMessage) ||
        ((_t = (_s = (_r = (_q = webMessage === null || webMessage === void 0 ? void 0 : webMessage.message) === null || _q === void 0 ? void 0 : _q.extendedTextMessage) === null || _r === void 0 ? void 0 : _r.contextInfo) === null || _s === void 0 ? void 0 : _s.quotedMessage) === null || _t === void 0 ? void 0 : _t.stickerMessage));
    if (!content)
        return null;
    const stream = yield (0, baileys_1.downloadContentFromMessage)(content, "sticker");
    let buffer = Buffer.from([]);
    try {
        for (var stream_3 = __asyncValues(stream), stream_3_1; stream_3_1 = yield stream_3.next(), !stream_3_1.done;) {
            const chunk = stream_3_1.value;
            buffer = Buffer.concat([buffer, chunk]);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (stream_3_1 && !stream_3_1.done && (_o = stream_3.return)) yield _o.call(stream_3);
        }
        finally { if (e_3) throw e_3.error; }
    }
    let directory = [__dirname, "..", "assets"];
    if (!folder) {
        directory = [...directory, "temp"];
    }
    if (folder) {
        directory = [...directory, folder];
    }
    if (subFolders.length) {
        directory = [...directory, ...subFolders];
    }
    const filePath = path_1.default.resolve(...directory, `${fileName}.webp`);
    yield (0, promises_1.writeFile)(filePath, buffer);
    return filePath;
});
exports.downloadSticker = downloadSticker;
const isSuperAdmin = (botData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, exports.validate)("superadmin", botData);
});
exports.isSuperAdmin = isSuperAdmin;
const isAdmin = (botData) => __awaiter(void 0, void 0, void 0, function* () {
    return ((yield (0, exports.validate)("admin", botData)) ||
        (yield (0, exports.validate)("superadmin", botData)));
});
exports.isAdmin = isAdmin;
const validate = (type, { remoteJid, socket, userJid }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, baileys_1.isJidGroup)(remoteJid))
        return true;
    const { participants } = yield socket.groupMetadata(remoteJid);
    const participant = participants.find((participant) => participant.id === userJid);
    return participant && participant.admin === type;
});
exports.validate = validate;
const onlyNumbers = (text) => {
    return text.replace(/[^0-9]/g, "");
};
exports.onlyNumbers = onlyNumbers;
const detectLink = (botData) => __awaiter(void 0, void 0, void 0, function* () {
    var _u, _v, _w, _x, _y, _z, _0, _1;
    const { remoteJid, socket, userJid, sendText, webMessage, command, args } = botData;
    if (yield (0, exports.isAdmin)(botData))
        return;
    const json = (0, exports.readJSON)(path_1.default.resolve(__dirname, "..", "cache", "antilink.json"));
    const antiLink = json.find(({ group_jid }) => group_jid === remoteJid);
    if (!antiLink || !antiLink.active)
        return;
    const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regex = new RegExp(expression);
    let messageTest;
    if (command || args) {
        messageTest = ((_u = command !== null && command !== void 0 ? command : "" + " " + args) !== null && _u !== void 0 ? _u : "").trim();
    }
    else if (((_v = webMessage.message) === null || _v === void 0 ? void 0 : _v.extendedTextMessage) &&
        ((_x = (_w = webMessage.message) === null || _w === void 0 ? void 0 : _w.extendedTextMessage) === null || _x === void 0 ? void 0 : _x.text)) {
        messageTest = webMessage.message.extendedTextMessage.text;
    }
    else if (((_y = webMessage.message) === null || _y === void 0 ? void 0 : _y.imageMessage) &&
        ((_0 = (_z = webMessage.message) === null || _z === void 0 ? void 0 : _z.imageMessage) === null || _0 === void 0 ? void 0 : _0.caption)) {
        messageTest = (_1 = webMessage.message) === null || _1 === void 0 ? void 0 : _1.imageMessage.caption;
    }
    if (!messageTest)
        return;
    const test = regex.test(messageTest) ||
        messageTest.includes(".com") ||
        messageTest.includes(".net") ||
        messageTest.includes(".xyz");
    const isBurledCommand = messageTest.includes("ī") && messageTest.includes(".com");
    if (!test && !isBurledCommand)
        return;
    yield sendText("Antilink ativado! Banindo meliante... ⌛");
    yield socket.groupParticipantsUpdate(remoteJid, [userJid], "remove");
    yield sendText("Banido por envio de link! ⛔");
});
exports.detectLink = detectLink;
