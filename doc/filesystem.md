# The ChirpOS File System #

The file system of ChirpOS is represented as an instance of an `io.FileSystem`
object. This instance holds an `io.RootDirectory` object, which is mostly just a
regular directory without a parent. The root directory holds everything in the
file system, which is made up of instances of the subclass `io.FileSystemNode`.
Each of these objects is accessed by regular Javascript object keys(strings) in
order to save time on lookups. The root directory can optionally have a name,
like a drive letter would on Windows. By default, it has no name.

What a file system structure may look like in ChripOS:
```
io.FileSystem
└─ io.RootDirectory
   |── io.Directory
   |   |── io.Directory
   |   └── io.File
   |   └── ...
   └── io.File
   └─ ...
```

### Attributes ###
Since filenames are stored as keys(or properties) within a directory object,
this can cause issues with determining if a key actually refers to a regular
property or a filename. A simple way around this problem is to prefix regular
properties with a directory separator. Filenames cannot contain a directory
separator in them because of the confusion they would cause in path strings.

 All `io.FileSystemNode` objects have attributes associated with them through an
 `io.FileSystemNodeInfo` object. Attributes that are stored are:
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
TODO

### File System Module Class Hierarchy ###
```
io.FileSystem
io.FileSystemInfo
io.FileSystemNode
└─ io.BaseDirectory
|  └─ io.RootDirectory
|  └─ io.Directory
└─ io.File
io.FileSystemNodeInfo
io.FileStream
```
