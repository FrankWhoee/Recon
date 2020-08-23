async function render_wrap(position) {
    document.getElementById("recommended").innerHTML = ""
    document.getElementById("week").innerHTML = ""

    get_data(position).then(function (result) {
        render_data_week(result)
        $('.tooltipped').tooltip();
    })
    get_data(position, sorted = true).then(function (result) {
        render_data_recommended(result)
        $('.tooltipped').tooltip();
    })

    render_preferences_wrap()
}

function update_pref() {
    sliders = document.getElementsByClassName("preference_slider")
    payload = {}
    for (i = 0; i < sliders.length; i++) {
        payload[sliders[i].id] = sliders[i].value
    }
    $.ajax({
        type: "POST",
        url: '/update_pref',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(render_wrap, geoError);
            } else {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: 'Your browser does not support geolocation!',
                    showConfirmButton: false,
                    timer: 2000,
                    backdrop: false,
                    toast: true,
                    customClass: {
                        border: '5px solid black'
                    }
                })
            }
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            alert(err.Message);
            Swal.fire({
                position: 'top',
                icon: 'error',
                title: 'Something went wrong when contacting the server.',
                showConfirmButton: false,
                timer: 2000,
                backdrop: false,
                toast: true,
                customClass: {
                    border: '5px solid black'
                }
            })
        }
    });
}


function render_data_preferences(data) {
    keys = Object.keys(data)
    for (i = 0; i < keys.length; i++) {
        console.log(keys[i])
        document.getElementById(keys[i]).value = data[keys[i]]
    }
}

function render_data_recommended(data) {
    for (i = 0; i < 3; i++) {
        div = document.getElementById("recommended")
        br = document.createElement("br")
        node = document.createElement("div")
        node.innerHTML = "<div class=\"card-white\">\n" +
            "            <div class=\"row\">\n" +
            "                <div class=\"col-sm-auto\">\n" +
            "                    <h3>" + new Date(data[i]["dt"] * 1000).toLocaleString('en-us', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            }) + "</h3>\n" +
            "                    <h1 style=\"color: " + data[i]["colour"] + "; font-size: 6rem\">" + Math.round(data[i]["score"] * 10) / 10 + "</h1>\n" +
            "                    <div class=\"row my-2\">\n" +
            "                        <div class=\"col\">\n" +
            "                            <img class=\"tooltipped\" data-position=\"top\"\n" +
            "                                 data-tooltip=\"Peak Temperature\" src=\"../assets/peak-arrow.svg\"> " + data[i]["maxtemp"] + "°C\n" +
            "                        </div>\n" +
            "                        <div class=\"col\">\n" +
            "                            <img class=\"tooltipped\" data-position=\"top\"\n" +
            "                                 data-tooltip=\"Cloudiness\" src=\"../assets/cloud.svg\"> " + data[i]["clouds"] + "%\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                    <div class=\"row\">\n" +
            "                        <div class=\"col\">\n" +
            "                            <img class=\"tooltipped\" data-position=\"top\"\n" +
            "                                 data-tooltip=\"Morning Temperature\" src=\"../assets/min-arrow.svg\"> " + data[i]["morntemp"] + "°C\n" +
            "                        </div>\n" +
            "                        <div class=\"col\">\n" +
            "                            <img class=\"tooltipped\" data-position=\"top\"\n" +
            "                                 data-tooltip=\"Probability of Precipitation\" src=\"../assets/water-drop.svg\"> " + data[i]["pop"] + "%\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "                <div class=\"col\">\n" +
            "                    <img src=\"http://openweathermap.org/img/wn/10d@2x.png\"\n" +
            "                         style=\"position: absolute; bottom: 50%; left: 50%; transform: translate(-50%,50%)\">\n" +
            "                </div>\n" +
            "            </div>\n"
        div.appendChild(node)
        div.appendChild(br)
    }
}

function render_data_week(data) {
    for (i = 0; i < data.length; i++) {
        div = document.getElementById("week")
        br = document.createElement("br")
        node = document.createElement("a")
        node.href = "#collapse" + i
        node.setAttribute("data-toggle", "collapse")
        node.innerHTML = "<div class=\"bar-white\">\n" +
            "\n" +
            "                <div class=\"row\" style=\"font-size: 2rem\">\n" +
            "                    <div class=\"col text-center\">\n" +
            "                        <img src=\"" + data[i]["icon"] + "\">\n" +
            "                    </div>\n" +
            "                    <div class=\"col text-center text-vertical-center\">\n" +
            "                        " + new Date(data[i]["dt"] * 1000).toLocaleString('en-us', {weekday: 'long'}) + "\n" +
            "                    </div>\n" +
            "                    <div class=\"col text-center text-vertical-center text-horizontal-center\" style=\"color: " + data[i]["colour"] + ";\">\n" +
            "                        " + Math.round(data[i]["score"]) + "\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "                <div class=\"collapse text-center pb-3\" id=\"collapse" + i + "\">\n" +
            "                    <div class=\"row my-2 px-5\">\n" +
            "                        <div class=\"col\">\n" +
            "                            <img src=\"../assets/peak-arrow.svg\"> " + data[i]["maxtemp"] + "°C\n" +
            "                        </div>\n" +
            "                        <div class=\"col\">\n" +
            "                            <img src=\"../assets/cloud.svg\"> " + Math.round(data[i]["clouds"]) + "%\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                    <div class=\"row px-5\">\n" +
            "                        <div class=\"col\">\n" +
            "                            <img src=\"../assets/min-arrow.svg\"> " + data[i]["morntemp"] + "°C\n" +
            "                        </div>\n" +
            "                        <div class=\"col\">\n" +
            "                            <img src=\"../assets/water-drop.svg\"> " + Math.round(data[i]["pop"] * 100) + "%\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "            </div>"
        div.appendChild(node)
        div.appendChild(br)
    }
}

function reset_preferences_wrap() {
    $.ajax({
        type: "GET",
        url: '/reset_pref',
        success: function (response) {
            data = JSON.parse(response)
            render_data_preferences(data)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(render_wrap, geoError);
            } else {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: 'Your browser does not support geolocation!',
                    showConfirmButton: false,
                    timer: 2000,
                    backdrop: false,
                    toast: true,
                    customClass: {
                        border: '5px solid black'
                    }
                })
            }
        }
    })
}

function render_preferences_wrap() {
    $.ajax({
        type: "GET",
        url: '/pref',
        success: function (response) {
            data = JSON.parse(response)
            console.log(data)
            render_data_preferences(data)
        }
    })
}

async function get_data(position, sorted = false) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "GET",
            url: '/data?lat=' + position.coords.latitude + '&long=' + position.coords.longitude + '&score_sorted=' + sorted,
            success: function (response) {
                resolve(JSON.parse(response));
            },
            error: function () {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: 'Something went wrong while contacting the server.',
                    showConfirmButton: false,
                    timer: 2000,
                    backdrop: false,
                    toast: true,
                    customClass: {
                        border: '5px solid black'
                    }
                })
                reject;
            }
        })
    })
}

function geoError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            Swal.fire({
                position: 'top',
                icon: 'error',
                title: 'We do not have access to your location.',
                showConfirmButton: false,
                timer: 2000,
                backdrop: false,
                toast: true,
                customClass: {
                    border: '5px solid black'
                }
            })
            break;
        case error.POSITION_UNAVAILABLE:
            Swal.fire({
                position: 'top',
                icon: 'error',
                title: 'Location information is not available!',
                showConfirmButton: false,
                timer: 2000,
                backdrop: false,
                toast: true,
                customClass: {
                    border: '5px solid black'
                }
            })
            break;
        case error.TIMEOUT:
            Swal.fire({
                position: 'top',
                icon: 'error',
                title: 'It took too long to get your location. Try again later!',
                showConfirmButton: false,
                timer: 2000,
                backdrop: false,
                toast: true,
                customClass: {
                    border: '5px solid black'
                }
            })
            break;
        case error.UNKNOWN_ERROR:
            Swal.fire({
                position: 'top',
                icon: 'error',
                title: 'An unknown geolocation error occured. Sorry :(',
                showConfirmButton: false,
                timer: 2000,
                backdrop: false,
                toast: true,
                customClass: {
                    border: '5px solid black'
                }
            })
            break;
    }
}

$(document).ready(function () {
        $('.preference_slider').change(function () {
            update_pref()
        })

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(render_wrap, geoError);
        } else {
            Swal.fire({
                position: 'top',
                icon: 'error',
                title: 'Your browser does not support geolocation!',
                showConfirmButton: false,
                timer: 2000,
                backdrop: false,
                toast: true,
                customClass: {
                    border: '5px solid black'
                }
            })
        }
        $('.tooltipped').tooltip();
    }
);

$('.expand-on-hover').hover(function () {
    animeTarget = this;
    anime({
        targets: animeTarget,
        translateY: -5,
        scale: 1.1
    });
}, function () {
    animeTarget = this;
    anime({
        targets: animeTarget,
        translateY: 0,
        scale: 1
    });
});

