

async function render_wrap(position) {
    await render_data_week(await get_data(position))
    await render_data_recommended(get_data(position, true))
}

function render_data_recommended(data) {

}

function render_data_week(data) {
    for(i = 0; i < data.length; i++){
        div = document.getElementById("week")
        node = document.createElement("a")
        node.href = "#collapse" + i
        node.setAttribute("data-toggle","collapse")
        node.innerHTML = "<div class=\"bar-white\">\n" +
            "\n" +
            "                <div class=\"row\" style=\"font-size: 2rem\">\n" +
            "                    <div class=\"col text-center\">\n" +
            "                        <img src=\"http://openweathermap.org/img/wn/"+data[i]["icon"]+"@2x.png\">\n" +
            "                    </div>\n" +
            "                    <div class=\"col text-center text-vertical-center\">\n" +
            "                        "+new Date(data[i]["dt"] * 1000).toLocaleString('en-us',{ weekday: 'long'})+"\n" +
            "                    </div>\n" +
            "                    <div class=\"col text-center text-vertical-center\" style=\"color: "+data["colour"]+";\">\n" +
            "                        "+data[i]["score"]+"\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "                <div class=\"collapse text-center pb-3\" id=\"collapse1\">\n" +
            "                    <div class=\"row my-2 px-5\">\n" +
            "                        <div class=\"col\">\n" +
            "                            <img src=\"../assets/peak-arrow.svg\"> "+data["maxtemp"]+"°C\n" +
            "                        </div>\n" +
            "                        <div class=\"col\">\n" +
            "                            <img src=\"../assets/cloud.svg\"> "+data["clouds"]+"%\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                    <div class=\"row px-5\">\n" +
            "                        <div class=\"col\">\n" +
            "                            <img src=\"../assets/min-arrow.svg\"> "+data["morntemp"]+"°C\n" +
            "                        </div>\n" +
            "                        <div class=\"col\">\n" +
            "                            <img src=\"../assets/water-drop.svg\"> "+data["pop"] * 100+"%\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "            </div>"
        div.appendChild(node)
    }
}

async function get_data(position, sorted=false) {
    var result;
    await $.ajax({
        type: "GET",
        url: '/data?lat=' + position.coords.latitude +'&long=' + position.coords.longitude + '&score_sorted=' + sorted,
        success: function (response) {
            result = JSON.parse(response);
        }
    }).then(function () {
        return result;
    })
}

$(document).ready(function () {
        $('.tooltipped').tooltip();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(render_wrap);
        } else {

        }
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

