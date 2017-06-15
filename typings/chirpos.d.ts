/**
 * ChirpOS - Typings
 * @author Cawdabra
 * @license MIT
 */

enum StatusCode {
    SUCCESS,
    PERMISSION_DENIED,
    FILE_NOT_FOUND,
    INVALID_PATH,
    STREAM_NOT_IN_READ_MODE,
    STREAM_NOT_IN_WRITE_MODE,
    STREAM_IS_CLOSED,
    FILE_IS_READ_LOCKED,
    FILE_IS_WRITE_LOCKED
}

class StatusObject {
    code: StatusCode;
    result: any;

    isSuccess(): boolean;
    constructor(code: StatusCode, result?: any);
}

function getStatusMessage(status_code: StatusCode): string;
function inheritClass(child_class: any, parent_class: any);

module "utils" {
    class ArrayUtils {
        static areEqual(arr1: Array, arr2: Array): boolean;
    }
}

module "io" {
    class FileSystem {
        info: FileSystemInfo;
        dirSeparator: string;
        private _root: Directory;

        getRoot(): Directory;
        getNodeFromPath(path: string): FileSystemNode;
        constructor(root_name: string, dir_sep?: string, info?: FileSystemInfo);
    }

    class FileSystemInfo {
        capacity: number;       // Number of characters in local storage

        constructor(capacity?: number);
    }

    class FileSystemNodeInfo {
        name: string;
        created: number;
        modified: number;
        accessed: number;
        flags: number;

        constructor(name: string, created?: number, modified?: number, accessed?: number, flags?: number);
    }

    enum FileSystemNodeFlag {
        SYSTEM,
        EXECUTABLE,
        HIDDEN,
        SUPER_HIDDEN
    }

    abstract class FileSystemNode {
        private info: FileSystemNodeInfo;
        parent: FileSystemNode;

        getPath(): string;
        getPathNodes(): Array;
        setFlag(flag: FileSystemNodeFlag);
        unsetFlag(flag: FileSystemNodeFlag);
        hasFlag(flag: FileSystemNodeFlag): boolean;
    }

    class Directory extends FileSystemNode {
        _children: Object;

        getNode(filename: string): StatusObject;
        setNode(node: FileSystemNode, user_mode?: boolean): StatusCode;
        deleteNode(filename: string, user_mode?: boolean): StatusCode;
        constructor(parent: Directory, info: FileSystemNodeInfo);
    }

    class File extends FileSystemNode {
        data: string;

        constructor(parent: Directory, info: FileSystemNodeInfo, data?: string);
    }

    class FileStream {
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
