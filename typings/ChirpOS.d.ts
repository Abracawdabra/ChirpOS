/**
 * ChirpOS - Typings
 * @author Cawdabra
 * @license MIT
 */

/**
 * All properties with a prefixed slash indicate that they start with a
 * directory separator. I'm not sure how you can make that a variable in a
 * TypeScript definition, so don't rely on "/info" (for example) being a
 * constant property name. Always use the get/set methods instead.
 */
module "io" {
    class FileSystem {
        info: FileSystemInfo;
        dirSeparator: string;

        constructor(info?: FileSystemInfo, dir_sep?: string) {}
    }

    class FileSystemInfo {
        name: string;

        constructor(name?: string) {}
    }

    class FileSystemNodeInfo {
        name: string;
        created: number;
        modified: number;
        accessed: number;
        flags: number;

        constructor(name: string, created?: number, modified?: number, accessed?: number, flags?: number) {}
    }

    abstract class FileSystemNode {
        private "/info": FileSystemNodeInfo;

        getInfo(): FileSystemNodeInfo;
        getPath(): string;
        getPathArray(): Array;
    }

    // Useful for instanceof on directory types
    abstract class BaseDirectory extends FileSystemNode {
    }

    class RootDirectory extends BaseDirectory {
        private "/fileSystem": FileSystem;

        getFileSystem(): FileSystem;
        constructor(file_system: FileSystem, info?: FileSystemNodeInfo) {}
    }

    class Directory extends BaseDirectory {
        private "/parent": BaseDirectory;

        getParent(): BaseDirectory;
        setParent(parent: BaseDirectory): void;
        constructor(parent: BaseDirectory, info: FileSystemNodeInfo) {}
    }

    class File extends FileSystemNode {
        private "/data": string;

        getData(): string;
        setData(data: string): void;
        constructor(parent: BaseDirectory, info: FileSystemNodeInfo, data?: string) {}
    }

    class FileStream {
        private _file: File;
        private _processID: number;
        private _kernel: kernel.Kernel;
        private _mode: string;
        private _bufferSize: number;

        getBufferSize(): number;
        setBufferSize(size: number): void;
        getMode(): string;
        read(chars?: number): global.StatusObject;
        readLine(): global.StatusObject;
        write(data: string): global.StatusCode;
        writeLine(data: string): global.StatusCode;
        flush(): global.StatusCode;
        close(): global.StatusCode;
        constructor(kernel: kernel.Kernel, process_id: number, file: File) {}
    }
}
