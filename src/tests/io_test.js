/**
 * ChirpOS - File System Tests
 * @author Cawdabra
 * @license MIT
 */
"use strict";

const io = require("io");
const ArrayUtils = require("utils").ArrayUtils;


// Returns a fake kernel instance (mainly because it hasn't been written yet)
var getFakeKernel = function() {
    return {
        canReadFromFile: function(pid, file) {
            return true;
        }
    };
};


QUnit.test("Create file test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    assert.equal(root.getPath(), "/");

    var test_file = new io.File(root, new io.FileSystemNodeInfo("test.txt"));
    assert.equal(root.setNode(test_file), StatusCode.SUCCESS);

    var status = root.getNode("test.txt");
    assert.equal(status.code, StatusCode.SUCCESS);
    assert.equal(status.result, test_file);
    assert.equal(test_file.getPath(), "/test.txt");
    assert.ok(ArrayUtils.areEqual(test_file.getPathNodes(), [root, test_file]), "Successfully got path nodes array");
});

QUnit.test("Get node from path string test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var test_file = new io.File(root, new io.FileSystemNodeInfo("test.txt"));
    assert.equal(root.setNode(test_file), StatusCode.SUCCESS);
    var status = fs.getNodeFromPath("/test.txt");
    assert.ok(status.isSuccess(), "Successfully got node from path string");
    assert.equal(status.result, test_file);
});

QUnit.test("Create file within nested directories test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var test_dir = new io.Directory(root, new io.FileSystemNodeInfo("test_dir"));
    assert.equal(root.setNode(test_dir), StatusCode.SUCCESS);

    var sub_dir = new io.Directory(test_dir, new io.FileSystemNodeInfo("sub_dir"));
    assert.equal(test_dir.setNode(sub_dir), StatusCode.SUCCESS);

    var test_file = new io.File(sub_dir, new io.FileSystemNodeInfo("test.txt"));
    assert.equal(sub_dir.setNode(test_file), StatusCode.SUCCESS);

    assert.equal(root.getPath(), "/");
    assert.equal(test_dir.getPath(), "/test_dir");
    assert.equal(sub_dir.getPath(), "/test_dir/sub_dir");
    assert.equal(test_file.getPath(), "/test_dir/sub_dir/test.txt");

    assert.ok(ArrayUtils.areEqual(test_file.getPathNodes(), [root, test_dir, sub_dir, test_file]), "Successfully returned path nodes array");
});

QUnit.test("Create files in system directory test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var system_dir = new io.Directory(root, new io.FileSystemNodeInfo("system_dir", 0, 0, 0, io.FileSystemNodeFlag.SYSTEM));
    root.setNode(system_dir);

    // Non-user mode
    var test_file = new io.File(system_dir, new io.FileSystemNodeInfo("test.txt"));
    assert.equal(system_dir.setNode(test_file), StatusCode.SUCCESS);
    assert.equal(system_dir.getNode("test.txt").result, test_file);

    // User mode
    var test_file2 = new io.File(system_dir, new io.FileSystemNodeInfo("test2.txt"));
    assert.equal(system_dir.setNode(test_file2, true), StatusCode.PERMISSION_DENIED);
    assert.equal(system_dir.getNode("test2.txt").code, StatusCode.FILE_NOT_FOUND);
});

QUnit.test("Delete nodes test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var test_dir = new io.Directory(root, new io.FileSystemNodeInfo("test_dir"));
    root.setNode(test_dir);

    assert.equal(root.deleteNode("test_dir"), StatusCode.SUCCESS);
    assert.equal(root.getNode("test_dir").code, StatusCode.FILE_NOT_FOUND);
});

QUnit.test("Delete files from system directory test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var system_dir = new io.Directory(root, new io.FileSystemNodeInfo("system_dir", 0, 0, 0, io.FileSystemNodeFlag.SYSTEM));
    assert.equal(root.setNode(system_dir), StatusCode.SUCCESS);

    // Non-user mode
    var test_file = new io.File(system_dir, new io.FileSystemNodeInfo("test.txt"));
    assert.equal(system_dir.setNode(test_file), StatusCode.SUCCESS);
    assert.equal(system_dir.deleteNode("test.txt"), StatusCode.SUCCESS);
    assert.equal(system_dir.getNode("test.txt").code, StatusCode.FILE_NOT_FOUND);

    // User mode
    var test_file2 = new io.File(system_dir, new io.FileSystemNodeInfo("test2.txt"));
    assert.equal(system_dir.setNode(test_file2), StatusCode.SUCCESS);
    assert.equal(system_dir.deleteNode("test2.txt", true), StatusCode.PERMISSION_DENIED);
    assert.equal(system_dir.getNode("test2.txt").result, test_file2);
});

QUnit.test("Read from file stream test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var test_file = new io.File(root, new io.FileSystemNodeInfo("test.txt"), "Hello World!");
    assert.equal(root.setNode(test_file), StatusCode.SUCCESS);

    var stream = new io.FileStream(getFakeKernel(), null, test_file, "r");
    assert.equal(stream.read(2).result, "He");
    assert.equal(stream.read().result, "llo World!");

    stream.seek(6);
    assert.equal(stream.tell(), 6);
    assert.equal(stream.read().result, "World!");
});

QUnit.test("Read from file stream in write-only mode test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var test_file = new io.File(root, new io.FileSystemNodeInfo("test.txt"), "Hello World!");
    assert.equal(root.setNode(test_file), StatusCode.SUCCESS);

    var stream = new io.FileStream(null, null, test_file, "w");
    assert.equal(stream.read().code, StatusCode.STREAM_NOT_IN_READ_MODE);
});

QUnit.test("Read from system file with file stream test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var test_file = new io.File(root, new io.FileSystemNodeInfo("test.txt", 0, 0, 0, io.FileSystemNodeFlag.SYSTEM), "Hello World!");
    assert.equal(root.setNode(test_file), StatusCode.SUCCESS);

    var stream = new io.FileStream(null, null, test_file, "r");
    assert.equal(stream.read().code, StatusCode.PERMISSION_DENIED);
});

QUnit.test("Read line from file stream test", function(assert) {
    var fs = new io.FileSystem();
    fs.dirSeparator = "/";

    var root = fs.getRoot();
    var test_file = new io.File(root, new io.FileSystemNodeInfo("test.txt"));
    test_file.data = "Hello World!\nThis is a multi-line string.\nButts.";

    var stream = new io.FileStream(getFakeKernel(), null, test_file, "r");
    assert.equal(stream.readLine().result, "Hello World!\n");
    assert.equal(stream.readLine().result, "This is a multi-line string.\n");
    assert.equal(stream.readLine().result, "Butts.");
});

// TODO: Write tests for file locks
