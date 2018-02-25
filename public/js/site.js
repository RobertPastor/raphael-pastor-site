
var worker = undefined;

$(document).ready(function () {

    //console.log("document is ready!");

    if (typeof (Worker) !== "undefined") {
        // Yes! Web worker support!
        // Some code.....
        if (typeof (worker) == "undefined") {
            worker = new Worker("/js/worker.js");
            worker.onmessage = function (event) {

                var workerProgressBar = document.getElementById('workerId');
                workerProgressBar.value = event.data;

                var workerProgressValue = document.getElementById('workerVal');
                workerProgressValue.innerHTML = event.data;
            };
        }

    } else {
        // Sorry! No Web Worker support..
    }

    // Get the element with id="defaultOpen" and click on it
    // define the default tab that will be displayed
    document.getElementById("defaultOpen").click();

    // show the progress bars related to the images loading process
    $('#prepImages').show();
    $('#loadImages').show();
    loadImages();

});




function stopWorker() {
    worker.terminate();
    worker = undefined;
    console.log("worker is stopped !!!");
    // hide the progress bars
    $('#prepImages').hide();
    $('#loadImages').hide();

}

var imagesIndex = 0;

function updateProgress() {
    var progressBar = document.getElementById('progressId');
    progressBar.value = String(imagesIndex++);
    var progressValue = document.getElementById('progressVal');
    progressValue.innerHTML = String(imagesIndex);
}

function initProgressBar() {
    // Gets the number of image elements
    var numberImages = $('img').length;
    var progressBar = document.getElementById('progressId');
    progressBar.max = String(numberImages);
}


function closeConnectionWithMongoAtlas() {

    $.ajax({
        cache: false,
        type: 'GET',
        url: '/close',
        success: function (data) {
            console.log("Connection closed with Mongo ATLAS !!! ");
            connectedToMongoAtlas = false;
        },
        error: function () {
            console.log("Failed to close a connection with Mongo ATLAS !!! ");
            connectedToMongoAtlas = false;
        }
    });
}

var connectedToMongoAtlas = undefined;

function loadOneImage(imagefileName) {

    if ((imagefileName != undefined) && (connectedToMongoAtlas == true)) {
        $.ajax({
            cache: false,
            type: 'GET',
            url: '/read/' + (imagefileName),
            success: function (data) {

                // the server has succeed to load the image
                console.log("success for file = " + imagefileName);

                // do stuff after images are loaded here
                // add the source attribute to the images
                var id = String(imagefileName).split('.')[0];

                $('#' + id).attr("src", "/temp/" + imagefileName).load(function () {

                    var numberOfImages = $('img').length;
                    console.log('index= ' + String(imagesIndex) + ' image = ' + imagefileName + ' is loaded - there are = ' + String(numberOfImages));

                    // update Progress bar
                    updateProgress();

                    // if last image => close the connection
                    if (imagesIndex >= $('img').length) {
                        closeConnectionWithMongoAtlas();
                        stopWorker();
                    }
                });
            },
            error: function () {
                console.log('failed to retrieve the image= ' + imagefileName);
                closeConnectionWithMongoAtlas();
            }
        });
    }
}

function slugify(text) {
    // Replace spaces with -
    return text.toString().replace(/\s+/g, '-')
}


function loadImages() {

    // init progress bar.
    initProgressBar();
    // start with a connection to MONGO ATLAS
    if (connectedToMongoAtlas == undefined) {
        // starting setting to false
        connectedToMongoAtlas = false;
        $.ajax({
            cache: false,
            type: 'GET',
            url: '/connect',
            success: function (data) {

                console.log("Connection established with Mongo ATLAS !!! ");
                connectedToMongoAtlas = true;

                // loop through the images
                $('img').each(function () {

                    //console.log($(this).attr('name'));
                    var imagefileName = $(this).attr('name');
                    loadOneImage(imagefileName);

                });
            },
            error: function () {
                console.log("Failed to establish a connection with Mongo ATLAS !!! ");
                connectedToMongoAtlas = false;
            }
        });
    }
}

/**
 * manage the tabbed content
 * @param {*} evt
 * @param {*} tabName
 */
function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
