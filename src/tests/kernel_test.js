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
