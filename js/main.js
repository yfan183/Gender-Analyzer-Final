var currentGender;
var datalength;
var appHeader = $("#app-header")[0];
var mainContainer = $("#main-body-container")[0];
var imageSelector = $("#file-selector")[0];
// Register button listeners
imageSelector.addEventListener("change", function () {
    appHeader.innerHTML = "Just a moment while we analyze the gender...";
    analyzeImage(function (file) {
        // Get genders based on image
        sendGenderRequest(file, function (faceScores) {
            // Find out most dominant gender
            currentGender = getCurrGender(faceScores); //send face attributes to find out the gender
            UI_Response(); //updates the UI, with their gender
        });
    });
});
function analyzeImage(callback) {
    var file = imageSelector.files[0];
    var imagereader = new FileReader();
    if (file) {
        imagereader.readAsDataURL(file); //used to read the contents of the file
    }
    else {
        console.log("Invalid file format");
    }
    imagereader.onloadend = function () {
        //After loading the file it validates the file type to be jpeg/jpg/png and let's the user know if it isn't
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            appHeader.innerHTML = "Please ensure your image file type is jpg or png.";
        }
        else {
            //if file is a photo it sends the file reference back up
            callback(file);
        }
    };
}
function UI_Response() {
    //Show detected gender
    if (datalength > 1){
        appHeader.innerHTML = "There were " + datalength +" people in the photo, that's too much for us to handle, one person at a time please."    
    }
    else{
        appHeader.innerHTML = "The person's gender is: " + currentGender.name;
        //Show gender icon
    var image = $("#input-image")[0]; //determines a predefined area on our webpage to show the gender
    image.src = currentGender.icon; //link that area to the gender of our currentGender.
    image.style.display = "block"; //formatting the icon's placement
    mainContainer.style.marginTop = "20px";
    }
    
}
function sendGenderRequest(file, callback) {
    $.ajax({
        url: "https://api.projectoxford.ai/face/v1.0/detect?returnFaceId=false&returnFaceLandmarks=false&returnFaceAttributes=gender&returnFaceLandmarks=false&returnFaceAttributes=gender",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "12a1125cc1ee466f9c368794b73e45a6");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
        if (data.length != 0) {
            // returns faceAttribute from Face API
            var faceAttributes = data[0].faceAttributes;
            var datalength1 = data.length;
            datalength = datalength1;
            callback(faceAttributes);
        }
        else {
            appHeader.innerHTML = "Hmm, we didn't manage to detect a human face. Try another?";
        }
    })
        .fail(function (error) {
        appHeader.innerHTML = "Oops, something went wrong. :( Try again in a bit?";
        console.log(error.getAllResponseHeaders());
    });
}
// Section of code that handles the gender
//A Gender class which has the gender as a string and its corresponding icon
var Gender = (function () {
    function Gender(sex, iconurl) {
        this.sex = sex;
        this.iconurl = iconurl;
        this.name = sex;
        this.icon = iconurl;
    }
    return Gender;
}());
var male = new Gender("male", "https://cdn4.iconfinder.com/data/icons/dot/256/man_person_mens_room.png");
var female = new Gender("female", "https://cdn4.iconfinder.com/data/icons/dot/256/ladies_room_toilet.png");
// any type as the face attribute is from the project oxford api request due to unknow returned data's type
function getCurrGender(faceAttributes) {
    if (faceAttributes.gender === "male") {
        currentGender = male;
    }
    else {
        currentGender = female;
    }
    return currentGender;
}

