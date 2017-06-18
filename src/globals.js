/**
 * ChirpOS - Globals
 * @author Cawdabra
 * @license MIT
 */
"use strict";

/**
 * @enum
 */
global.StatusCode = {
    SUCCESS: 0,
    PERMISSION_DENIED: 1,
    FILE_NOT_FOUND: 2,
    INVALID_PATH: 3,
    STREAM_NOT_IN_READ_MODE: 4,
    STREAM_NOT_IN_WRITE_MODE: 5,
    STREAM_IS_CLOSED: 6,
    FILE_IS_READ_LOCKED: 7,
    FILE_IS_WRITE_LOCKED: 8,
    PROCESS_YIELD: 9,
    NODE_IS_NOT_DIRECTORY: 10,
    FILE_LOCK_NOT_FOUND: 11
};

/**
 * A returned status from a function or method
 * @class
 * @param {StatusCode} code
 * @param {object} [result] An object to pass for when successful
 */
global.StatusObject = function(code, result) {
    this.code = code;
    this.result = (result) ? result : null;
};

/**
 * Returns if successful status
 * @return {boolean}
 */
global.StatusObject.prototype.isSuccess = function() {
    return (this.code === StatusCode.SUCCESS);
};

/**
 * Returns a message from a status code
 * @param {StatusCode} status_code
 * @return {string}
 */
global.getStatusMessage = function(status_code) {
    switch (status_code) {
        case SUCCESS:
            return "OK";
        case PERMISSION_DENIED:
            return "Permission denied";
        case FILE_NOT_FOUND:
            return "File not found";
        case INVALID_PATH:
            return "Invalid path";
        case STREAM_NOT_IN_READ_MODE:
            return "File stream is not in read mode";
        case STREAM_NOT_IN_WRITE_MODE:
            return "File stream is not in write mode";
        case STREAM_IS_CLOSED:
            return "Stream is closed";
        case FILE_IS_READ_LOCKED:
            return "File is currently read locked by another process";
        case FILE_IS_WRITE_LOCKED:
            return "File is currently write locked by another process";
        case NODE_IS_NOT_DIRECTORY:
            return "Node is not a directory";
        case FILE_LOCK_NOT_FOUND:
            return "File lock not found";
    }

    return "";
};

/**
 * Makes a child class inherit a parent class
 * @param {function} child_class
 * @param {function} parent_class
 */
global.inheritClass = function(child_class, parent_class) {
    child_class.prototype = Object.create(parent_class.prototype);
};
