document.addEventListener("deviceready", onDeviceReady, false);

// PhoneGap is ready
//
function onDeviceReady() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}

function gotFS(fileSystem) {
    fileSystem.root.getFile("test.txt", { create: true }, gotFileEntry, fail);
}

function gotFileEntry(fileEntry) {
    fileEntry.createWriter(gotFileWriter, fail);
}

function gotFileWriter(writer) {
    writer.onwrite = function (evt) {
        alert("write success");
    };

    writer.write("some sample text");
    writer.abort();
    // contents of file now 'some different text'
}

function fail(error) {
   alert("error : " + error.code);
}