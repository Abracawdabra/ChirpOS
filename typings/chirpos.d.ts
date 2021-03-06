/**
 * ChirpOS - Typings
 * @author Cawdabra
 * @license MIT
 */

export enum StatusCode {
    SUCCESS,
    PERMISSION_DENIED,
    FILE_NOT_FOUND,
    INVALID_PATH,
    STREAM_NOT_IN_READ_MODE,
    STREAM_NOT_IN_WRITE_MODE,
    STREAM_IS_CLOSED,
    FILE_IS_READ_LOCKED,
    FILE_IS_WRITE_LOCKED,
    NODE_IS_NOT_DIRECTORY,
    FILE_LOCK_NOT_FOUND
}

export class StatusObject {
    code: StatusCode;
    result: any;

    isSuccess(): boolean;
    constructor(code: StatusCode, result?: any);
}

export function getStatusMessage(status_code: StatusCode): string;
export function inheritClass(child_class: any, parent_class: any);

export declare module _utils {
    export class ArrayUtils {
        static areEqual(arr1: Array, arr2: Array): boolean;
    }
}

export declare module _os {
    ROOT_DIR_NAME: string;
    FILE_SYSTEM_CAPACITY: number;
    FILE_STREAM_BUFFER_SIZE: number;

    export class path {
        DIR_SEPARATOR: string;

        getDirName(path: string): string;
        getBaseName(path: string): string;
        join(components: arguments): string;
    }
}

export declare module _log {
    export enum LogLevel {
        ERROR,
        WARN,
        INFO,
        DEBUG
    }

    export function addLoggerMethod(obj: Object): void;

    export class Logger {
        level: LogLevel;

        print(level: LogLevel, param2: string, param3?: string): void;
        error(param1: string, param2?: string): void;
        warn(param1: string, param2?: string): void;
        info(param1: string, param2?: string): void;
        debug(param1: string, param2?: string): void;
    }
}

export declare module _kernel {
    export class Kernel {
        _fileSystem: io.FileSystem;

        createFile(pid: number, path: string, flags: number, user_mode: boolean): StatusObject;
        makeDirs(pid: number, path: string, flags: number, user_mode: boolean): StatusObject;
        openFile(pid: number, path: string, mode: string, user_mode: boolean): StatusObject;
        copyFile(pid: number, source_path: string, dest_path: string, user_mode: boolean): StatusObject;
        deepCopyDir(pid: number, source: io.Directory, parent: io.Directory, new_name: string, user_mode: boolean): StatusObject;
        findFileLocks(file: io.File): object;
        canReadFrom(pid: number, file: io.File): boolean;
        canReadFromSingle(pid: number, file: io.File): boolean;
        canWriteTo(pid: number, file: io.File): boolean;
        canWriteToSingle(pid: number, file: io.File): boolean;
        readLockFile(pid: number, file: io.File, lock: boolean): StatusCode;
        writeLockFile(pid: number, file: io.File, lock: boolean): StatusCode;
        deleteFileLock(pid: number, file: io.File): StatusCode;
        constructor();
    }
}

export declare module _io {
    export class FileSystem {
        info: FileSystemInfo;
        dirSeparator: string;
        private _root: Directory;

        getRoot(): Directory;
        getNodeFromPath(path: string): FileSystemNode;
        constructor(root_name: string, dir_sep?: string, info?: FileSystemInfo);
    }

    export class FileSystemInfo {
        capacity: number;       // Number of characters in local storage

        constructor(capacity?: number);
    }

    export class FileSystemNodeInfo {
        name: string;
        created: number;
        modified: number;
        accessed: number;
        flags: number;

        constructor(name: string, created?: number, modified?: number, accessed?: number, flags?: number);
    }

    export enum FileFlag {
        SYSTEM,
        EXECUTABLE,
        HIDDEN,
        SUPER_HIDDEN
    }

    export abstract class FileSystemNode {
        private info: FileSystemNodeInfo;
        parent: FileSystemNode;

        getPath(): string;
        getPathNodes(): Array;
        setFlag(flag: FileFlag): void;
        unsetFlag(flag: FileFlag): void;
        hasFlag(flag: FileFlag): boolean;
    }

    export class Directory extends FileSystemNode {
        _children: Object;

        getNode(filename: string): StatusObject;
        setNode(node: FileSystemNode, user_mode?: boolean): StatusCode;
        deleteNode(filename: string, user_mode?: boolean): StatusCode;
        constructor(parent: Directory, info: FileSystemNodeInfo);
    }

    export class File extends FileSystemNode {
        data: string;

        constructor(parent: Directory, info: FileSystemNodeInfo, data?: string);
    }

    export class FileStream {
        private _file: File;
        private _pid: number;
        private _kernel: kernel.Kernel;
        private _mode: string;
        private _bufferSize: number;
        private _buffer: string;
        private _position: number;
        private _isClosed: boolean;

        close(): StatusCode;
        getBufferSize(): number;
        setBufferSize(size: number): void;
        getMode(): string;
        seek(pos: number): void;
        read(chars?: number): StatusObject;
        readLine(): StatusObject;
        write(data: string): StatusCode;
        writeLine(data: string): StatusCode;
        flush(): StatusCode;
        constructor(kernel: kernel.Kernel, pid: number, file: File, mode: string);
    }
}

export declare module _proc {
    export declare class Process {
        _kernel: kernel.Kernel;
        _pid: number;

        getPID(): number;
        openFile(filename: string, mode: string): StatusObject;
        abstract main(): StatusObject;
        constructor(kernel: kernel.Kernel, pid: number);
    }
}

export declare module _kernel {

}
