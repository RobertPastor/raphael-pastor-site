
$(document).ready(function () {

    //console.log("document is ready!");

    // Get the element with id="defaultOpen" and click on it
    // define the default tab that will be displayed
    document.getElementById("defaultOpen").click();
    // load the images
    loadImages();
});


function updateProgress(newValue) {
    var progressBar = document.getElementById('progressId');
    progressBar.value = String(newValue);
    var progressValue = document.getElementById('pVal');
    progressValue.innerHTML = String(newValue);
}

function initProgressBar() {
    // Gets the number of image elements
    var numberImages = $('img').length;
    var progressBar = document.getElementById('progressId');
    progressBar.max = String(numberImages);
}

function loadImages() {
    // init progress bar.
    initProgressBar();
    var nbImages = 1;
    // loop through the images
    $('img').each(function () {

        //console.log($(this).attr('name'));
        var imagefileName = $(this).attr('name');
        // should not retrieve the gif road runner here
        if (imagefileName != undefined) {
            $.ajax({
                cache: false,
                type: 'GET',
                url: '/read/' + (imagefileName),
                success: function (data) {

                    //console.log("success for file = " + imagefileName);
                    // do stuff after images are loaded here
                    // add the source attribute to the images
                    var id = String(imagefileName).split('.')[0];
                    $('#' + id).attr("src", "/temp/" + imagefileName).load(function () {
                        //console.log('image = ' + imagefileName + ' is loaded ');
                        // update Progress bar
                        updateProgress(nbImages++);
                    });
                },
                error: function () {
                    console.log('failed to retrieve the image= ' + imagefileName);
                },
            });
        }
    });
}

function slugify(text) {
    return text.toString()
        .replace(/\s+/g, '-')           // Replace spaces with -
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
