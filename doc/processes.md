# ChirpOS Processes #

Each process runs in user space; meaning that they have their own dedicated
portion of memory. When a process is created, it gets its own copy of the
parent's environment object. This makes it so that the process can alter
its environment without affecting the parent process' environment.

The shell is generally the parent of most user run processes. However, processes
can run side-by-side in a sucky pseudo-multi-threaded way. They are unlimited in
how much processing time they are allowed, and yield to the kernel whenever they
want. Yielding gives other processes a chance to run so that the system can be
one big happy family. So don't be greedy!

The shell yields at [to be decided], unless a child process is running. User
scripts will automatically yielded by the shell  after certain statements, such
as after one iteration of a loop.

### Shared User Space ###

If processes require the use of a volatile environment to store data, they are
free to use the shared user space. Any process can read and write from this
space so that it can be used to "communicate" with other processes.

### File Locks ###

Processes can request read or write locks on files that don't have any owned by
other processes. The kernel keeps track of the locks by file and process ID.
When a process exits, all locks associated with it are destroyed.

Use `kernel.Kernel.lockFile` to create a lock.

### Environment ###

A process's environment is simply an ordinary Javascript object that acts as a
hash of `env.Data` and `env.Function` objects. There are four data types to
use work with:
+ Integer - Whole numbers between 9007199254740991 and -9007199254740991
+ Floater - Floating point numbers
+ String  - Strings of characters
+ Array   - Arrays of data objects (literals are converted to objects)

The `env.Data` class is directly used for variables(references to the data), but
may also be any kind of temporary piece of data that is placed on the stack.
They are also used as return types with `env.Function` objects.

Each `env.Function` object has its own little local environment, so that there
is no need to pollute the rest of the process environment. They have complete
access to the process environment and even the shared user space environment.
Along with the four data types, functions can have a return type of
`env.DataType.VOID`.

### Stack ###

TODO
