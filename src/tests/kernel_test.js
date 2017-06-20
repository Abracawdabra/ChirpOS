/**
 * ChirpOS - Kernel Tests
 * @author Cawdabra
 * @license MIT
 */
"use strict";

require("../globals.js");
const os = require("_os");
const kernel = require("_kernel");
const io = require("_io");
const ArrayUtils = require("_utils").ArrayUtils;


QUnit.test("Create new file test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.createFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);
});

QUnit.test("Create some nested directories test", function(assert) {
    var k = new kernel.Kernel();
    var path = os.path.join(os.ROOT_DIR_NAME, "dir1", "dir2", "dir3", "dir4", "dir5");
    var status = k.makeDirs(1, path, io.FileFlag.SYSTEM);
    assert.equal(status.code, StatusCode.SUCCESS);

    // Make sure each directory was created
    var node = status.result;
    var path_array = [node];
    var file_system = k.getFileSystem();
    while (node.parent !== file_system) {
        node = node.parent;
        path_array.unshift(node);
    }

    var path_array2 = status.result.getPathNodes();
    var i;
    for (i=1; i<path_array.length; ++i) {
        assert.equal(path_array[i], path_array2[i]);
        assert.equal(path_array[i].info.flags, io.FileFlag.SYSTEM);
    }
});

QUnit.test("File read lock test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.createFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var file = status.result;
    assert.equal(k.readLockFile(1, file, true), StatusCode.SUCCESS);
    assert.equal(k.canReadFrom(1, file), true);
    assert.equal(k.canWriteTo(1, file), true);

    // Pretend process 2 exists as well
    assert.equal(k.canReadFrom(2, file), false);
    assert.equal(k.canWriteTo(2, file), true);

    assert.equal(k.readLockFile(2, file, true), StatusCode.FILE_IS_READ_LOCKED);
});

QUnit.test("File read unlock test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.createFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var file = status.result;
    assert.equal(k.readLockFile(1, file, true), StatusCode.SUCCESS);
    assert.equal(k.readLockFile(1, file, false), StatusCode.SUCCESS);

    assert.equal(k.canReadFrom(1, file), true);
    assert.equal(k.canReadFrom(2, file), true);
});

QUnit.test("File write lock test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.createFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var file = status.result;
    assert.equal(k.writeLockFile(1, file, true), StatusCode.SUCCESS);
    assert.equal(k.canReadFrom(1, file), true);
    assert.equal(k.canWriteTo(1, file), true);

    // Pretend process 2 exists as well
    assert.equal(k.canReadFrom(2, file), true);
    assert.equal(k.canWriteTo(2, file), false);

    assert.equal(k.writeLockFile(2, file, true), StatusCode.FILE_IS_WRITE_LOCKED);
});

QUnit.test("File write unlock test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.createFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var file = status.result;
    assert.equal(k.writeLockFile(1, file, true), StatusCode.SUCCESS);
    assert.equal(k.writeLockFile(1, file, false), StatusCode.SUCCESS);

    assert.equal(k.canReadFrom(1, file), true);
    assert.equal(k.canReadFrom(2, file), true);
});

QUnit.test("Delete lock test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.createFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var file = status.result;
    assert.equal(k.readLockFile(1, file, true), StatusCode.SUCCESS);
    assert.equal(k.writeLockFile(1, file, true), StatusCode.SUCCESS);

    assert.equal(k.deleteFileLock(1, file), StatusCode.SUCCESS);
    assert.equal(k.canReadFrom(2, file), true);
});

QUnit.test("Lock directory test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.makeDirs(1, os.path.join(os.ROOT_DIR_NAME, "dir1", "dir2"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var dir = status.result;
    status = k.createFile(1, os.path.join(dir.getPath(), "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var file = status.result;
    assert.equal(k.readLockFile(1, dir, true), StatusCode.SUCCESS);
    assert.equal(k.canReadFrom(1, file), true);
    assert.equal(k.canReadFrom(1, dir), true);

    assert.equal(k.canReadFrom(2, file), false);
    assert.equal(k.canReadFrom(2, dir), false);

    assert.equal(k.writeLockFile(1, dir, true), StatusCode.SUCCESS);

    status = k.createFile(2, os.path.join(dir.getPath(), "test2.txt"), 0, true);
    assert.equal(status.code, StatusCode.FILE_IS_WRITE_LOCKED);

    // Unlock dir2 and lock dir1
    assert.equal(k.writeLockFile(1, dir, false), StatusCode.SUCCESS);
    status = k.createFile(2, os.path.join(dir.getPath(), "test2.txt"), 0, true);
    assert.equal(status.code, StatusCode.SUCCESS);

    assert.equal(k.writeLockFile(1, dir.parent, true), StatusCode.SUCCESS);
    assert.equal(k.canWriteTo(1, dir), true);
    assert.equal(k.canWriteTo(1, dir.parent), true);
    assert.equal(k.canWriteTo(2, dir), false);

    // Create file
    status = k.createFile(2, os.path.join(dir.getPath(), "test3.txt"), 0, true);
    assert.equal(status.code, StatusCode.FILE_IS_WRITE_LOCKED);

    status = k.createFile(2, os.path.join(dir.parent.getPath(), "test4.txt"), 0, true);
    assert.equal(status.code, StatusCode.FILE_IS_WRITE_LOCKED);

    // Make dirs
    status = k.makeDirs(2, os.path.join(dir.getPath(), "dir3", "dir4"), 0, true);
    assert.equal(status.code, StatusCode.FILE_IS_WRITE_LOCKED);

    status = k.makeDirs(2, os.path.join(dir.parent.getPath(), "dir5", "dir6"), 0, true);
    assert.equal(status.code, StatusCode.FILE_IS_WRITE_LOCKED);

    // Open file
    status = k.openFile(1, file.getPath(), "w", true);
    assert.equal(status.code, StatusCode.SUCCESS);

    status = k.openFile(2, file.getPath(), "w", true);
    assert.equal(status.code, StatusCode.FILE_IS_WRITE_LOCKED);
});

QUnit.test("Copy file test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.createFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);
    var file = status.result;
    file.setFlag(io.FileFlag.HIDDEN);
    file.data = "Hello World!";

    status = k.copyFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"), os.path.join(os.ROOT_DIR_NAME, "test_copy.txt"), true);
    assert.equal(status.code, StatusCode.SUCCESS);
    var file_copy = status.result;
    assert.equal(file_copy.info.name, "test_copy.txt");
    assert.equal(file.info.created, file_copy.info.created);
    assert.equal(file.info.modified, file_copy.info.modified);
    assert.equal(file.info.accessed, file_copy.info.accessed);
    assert.equal(file.info.flags, file_copy.info.flags);
    assert.equal(file.data, file_copy.data);
});

QUnit.test("Copy read locked file test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.createFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"));
    assert.equal(status.code, StatusCode.SUCCESS);
    var file = status.result;
    assert.equal(k.readLockFile(1, file, true), StatusCode.SUCCESS);

    status = k.copyFile(1, os.path.join(os.ROOT_DIR_NAME, "test.txt"), os.path.join(os.ROOT_DIR_NAME, "test_copy.txt"), true);
    assert.equal(status.code, StatusCode.SUCCESS);

    status = k.copyFile(2, os.path.join(os.ROOT_DIR_NAME, "test.txt"), os.path.join(os.ROOT_DIR_NAME, "test_copy2.txt"), true);
    assert.equal(status.code, StatusCode.FILE_IS_READ_LOCKED);

    // Parent directory lock
    assert.equal(k.readLockFile(1, file, false), StatusCode.SUCCESS);
    assert.equal(k.readLockFile(1, file.parent, true), StatusCode.SUCCESS);

    status = k.copyFile(2, os.path.join(os.ROOT_DIR_NAME, "test.txt"), os.path.join(os.ROOT_DIR_NAME, "test_copy3.txt"), true);
    assert.equal(status.code, StatusCode.FILE_IS_READ_LOCKED);
});

QUnit.test("Copy directory test", function(assert) {
    var k = new kernel.Kernel();
    var dirs = ["dir1", "dir2", "dir3"];
    var status = k.makeDirs(1, os.path.join(os.ROOT_DIR_NAME, dirs.join(os.path.DIR_SEPARATOR)));
    assert.equal(status.code, StatusCode.SUCCESS);


    var i, j, path;
    for (i=0; i<3; ++i) {
        path = os.path.join(os.ROOT_DIR_NAME, dirs.slice(0, i + 1).join(os.path.DIR_SEPARATOR));
        for (j=0; j<2; ++j) {
            status = k.createFile(1, os.path.join(path, "test" + j + ".txt"), io.FileFlag.HIDDEN);
            assert.equal(status.code, StatusCode.SUCCESS);
            status.result.data = "Hello World! " + i + " " + j;
        }
    }

    status = k.copyFile(1, os.path.join(os.ROOT_DIR_NAME, dirs[0]), os.path.join(os.ROOT_DIR_NAME, "dir1_copy"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var copy_path, file1, file2;
    for (i=0; i<3; ++i) {
        path = os.path.join(os.ROOT_DIR_NAME, dirs.slice(0, i + 1).join(os.path.DIR_SEPARATOR));
        copy_path = os.path.join(os.ROOT_DIR_NAME, "dir1_copy", dirs.slice(1, i + 1).join(os.path.DIR_SEPARATOR));
        for (j=0; j<2; ++j) {
            file1 = k.getFileSystem().getNodeFromPath(os.path.join(path, "test" + j + ".txt")).result;
            file2 = k.getFileSystem().getNodeFromPath(os.path.join(copy_path, "test" + j + ".txt")).result;

            assert.equal(file1.info.name, file2.info.name);
            assert.equal(file1.info.created, file2.info.created);
            assert.equal(file1.info.modified, file2.info.modified);
            assert.equal(file1.info.accessed, file2.info.accessed);
            assert.equal(file1.info.flags, file2.info.flags);
            assert.equal(file1.data, file2.data);
        }
    }
});

QUnit.test("Copy locked directory test", function(assert) {
    var k = new kernel.Kernel();
    var status = k.makeDirs(1, os.path.join(os.ROOT_DIR_NAME, "dir1", "dir2"));
    assert.equal(status.code, StatusCode.SUCCESS);

    var dir = status.result;
    assert.equal(k.readLockFile(1, dir, true), StatusCode.SUCCESS);

    status = k.copyFile(2, dir.getPath(), os.path.join(os.ROOT_DIR_NAME, "dir2_copy"), true);
    assert.equal(status.code, StatusCode.FILE_IS_READ_LOCKED);

    // Try copying with the parent locked
    assert.equal(k.deleteFileLock(1, dir), StatusCode.SUCCESS);
    assert.equal(k.readLockFile(1, dir.parent, true), StatusCode.SUCCESS);
    status = k.copyFile(2, dir.getPath(), os.path.join(os.ROOT_DIR_NAME, "dir2_copy"), true);
    assert.equal(status.code, StatusCode.FILE_IS_READ_LOCKED);

    // Try copying with the destination directory write locked
    assert.equal(k.deleteFileLock(1, dir.parent), StatusCode.SUCCESS);
    assert.equal(k.writeLockFile(1, k.getFileSystem().getRoot(), true), StatusCode.SUCCESS);
    status = k.copyFile(2, dir.getPath(), os.path.join(os.ROOT_DIR_NAME, "dir2_copy"), true);
    assert.equal(status.code, StatusCode.FILE_IS_WRITE_LOCKED);
});
