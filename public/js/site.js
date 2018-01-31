
$(document).ready(function () {
    console.log("document is ready!");

    $('img').each(function () {

        console.log($(this).attr('name'));
        var imagefileName = $(this).attr('name');
        // should not give the gif road runner here
        if (imagefileName != undefined) {
            $.ajax({
                cache: false,
                type: 'GET',
                url: '/read/' + (imagefileName),
                success: function (data) {

                    console.log("success for file = " + imagefileName);
                    // do stuff after images are loaded here
                    // add the source attribute to the images
                    var id = String(imagefileName).split('.')[0];
                    $('#' + id).attr("src", "/temp/" + imagefileName).load(function () {
                        console.log('image = ' + imagefileName + ' is loaded ');
                    });

                },
                error: function () {
                    console.log('failed to retrieve the image= ' + imagefileName);
                },
            });
        }
    });
});

function slugify(text) {
    return text.toString()
        .replace(/\s+/g, '-')           // Replace spaces with -

}
