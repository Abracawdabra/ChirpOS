# The ChirpOS File System #

The file system of ChirpOS is represented as an instance of the `_io.FileSystem`
class. This instance holds an `_io.Directory` object; a regular directory, only
with the file system being the parent. The root directory holds everything in
the file system, which is made up of instances of classes that inherit
`_io.FileSystemNode`. Each of these objects is accessed by regular Javascript
object keys(strings) in order to save time on lookups. The root directory can
optionally have a name, like a drive letter would on Windows. By default, it has
no name.

In order to store regular object properties alongside filenames, each directory
object will have a `_children` property which acts as the hash. This way, it is
possible to not have to worry about the user naming a file "getPath" (for
instance) and overwriting the actual `getPath` method of the parent object.

What a file system structure may look like in ChripOS:
```
io.FileSystem
└─ io.Directory (root)
   |── io.Directory
   |   |── io.Directory
   |   └── io.File
   |   └── ...
   └── io.File
   └─ ...
```

### Attributes ###
 All `_io.FileSystemNode` objects have attributes associated with them through an
 `_io.FileSystemNodeInfo` object. Attributes that are stored are:
 + Name : string
 + Creation date : number
 + Last modified date : number
 + Last accessed date : number
 + Flags : number

*All dates are stored as Unix timestamps.*

### Local Storage ###
Since ChirpOS is aimed mainly for the browser, saving data provides a challenge
with size limitations. The size limit for most browsers seems to be about or
greater than 5MB, and there is currently no way to get that limit without doing
a bunch of tests. For sake of ease, the file system will be set to an artificial
limit of 5,238,880 bytes(approx. 4.996 megabytes) regardless of how much can
actually be stored.

Javascript strings are encoded in UTF-16 (or UCS-2 with surrogates apparently).
So using the maximum possible size of a character (2 bytes) as the basis, 5
megabytes being 5,242,880 bytes, and leaving a bit of wiggle room for other
applications(2,000 bytes); we have 2,619,440 characters to work with.

To better utilize this limited storage capacity, ChirpOS will only store newly
created or modified files. They will all be stored as one JSON string to make
them easier to load in while still being fairly compact in structure. To further
save space, the JSON string will be compressed using the
[lz-string library](http://pieroxy.net/blog/pages/lz-string/index.html).

### File Streams ###
Files are normally accessed and written to through `_kernel.Kernel.write()`,
which causes the local storage operations to occur. Doing local storage write
operations constantly might be a bit slow, so the `_io.FileStream` class
provides an abstraction layer with a write buffer, plus it automatically calls
the kernel's write method with the process ID of the process it is currently
attached to. The stream should however, be instantiated by using the
`_proc.Process.openFile()` method so as to automate the process of error
checking or creating new files when necessary.

This write buffer automatically flushes when it is full, and it also flushes
when the `_io.FileStream.close()` method is called when the stream is still
open.

### File Locking ###
Read and write locks can be claimed by individual processes or by the kernel
itself. Whenever data is about to be read or written, the kernel's write method
must check for any existing locks by other processes before doing so. If the
condition is true, then the method will error out. The error should be handled
inside of the file stream's write method as well. All of this is to prevent any
possible "race conditions"; where multiple processes read copies of one file
into memory, and any of them overwrites changes made by the other.

For more information, see the *File Locking* section in processes.md

### File System Module Class Hierarchy ###
```
io.FileSystem
io.FileSystemInfo
io.FileSystemNode
└─ io.Directory
└─ io.File
io.FileSystemNodeInfo
io.FileStream
```
