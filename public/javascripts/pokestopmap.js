var map, circle;

var portals = [];
var portalInfoWins = [];
var portalEventListeners = [];

var pokestops = [];
var gyms = [];
var neithers = [];

var searchMarkers = [];
var searchMarkerInfowins = [];
var searchMarkerEventListeners = [];

/* start my javascript */
function init() {
	map = createMap();
	setMapCustomControl();
	setMapEvent();
	setPortals();
}

$(window).on("load", function() {
	circle = drawCircle(map.getCenter());
    $('#search-menu').collapse('show');
});

/* Create map */
function createMap() {
	var mapOptions = {
	    center: new naver.maps.LatLng(37.4980038,127.0276628),
	    zoom: 12,
	    minZoom: 2,

	    scaleControl: false,
	    logoControl: false,
	    mapDataControl: false,
	    zoomControl: true,
	    zoomControlOptions: {
	            style: naver.maps.ZoomControlStyle.SMALL,
	            position: naver.maps.Position.RIGHT_TOP
	        },
	    mapTypeControl: true,
	    mapTypeControlOptions: {
	            position: naver.maps.Position.BOTTOM_RIGHT
	        },
	    disableKineticPan: false
	};

	var map = new naver.maps.Map('map', mapOptions);
	return map;
}

function setMapCustomControl() {
	/* Search bar */
	var searchBarHtml = '<div id="map-searchBar" class="input-group"><span class="input-group-btn"><button type="button" class="btn btn-default" data-toggle="collapse" data-target="#search-menu"><span class="glyphicon glyphicon-align-justify"></span></button></span><input type="text" id="search" name="query" class="form-control" placeholder="네이버 지도 검색" ><span class="input-group-btn"><button type="submit" id="searchBtn" class="btn btn-default"><span class="glyphicon glyphicon-search"></span></button></span></div>'
	var $searchBar = $(searchBarHtml);
	var searchBarEl = $searchBar[0];
	map.controls[naver.maps.Position.LEFT_TOP].push(searchBarEl);

    var $searchText = $('#search');
    var searchTextEl = $searchText[0];

	var $searchBarBtn = $('#searchBtn');
	var searchBarBtnEl = $searchBarBtn[0];

	naver.maps.Event.addDOMListener(searchBarBtnEl, 'click', function() {
	    setSearchMenu();
	});

    naver.maps.Event.addDOMListener(searchTextEl, 'keypress', function(e) {
        var ENTER = 13;

        if(e.which == ENTER) {
            $searchBarBtn.trigger('click');
        }
    });

	/* Search menu */
	var $searchMenu = $('#search-menu');
	var searchMenuEl = $searchMenu[0];
	map.controls[naver.maps.Position.TOP_LEFT].push(searchMenuEl);
}

/* Map Event */
function setMapEvent() {
	/* Map Event Listener */
	naver.maps.Event.addListener(map, 'click', function(e) {
	    if(map.getZoom() < 10) {
	        map.setCenter(e.coord);
	        map.setZoom(9);
	    }
	});

	naver.maps.Event.addListener(map, 'idle', function(e) { 
		if(map.getZoom() >= 10) {
			resetPortals();
			setPortals(map);
		}
		else {
			resetPortals();
			resetSearchMenu();
			var infowindow = new naver.maps.InfoWindow({
	            content: '<h5><strong>Zoom in to see more pokestops</strong> <br />지도 클릭 시 해당 지역으로 이동</h5>'
	        });
	        infowindow.open(map, map.getCenter());
		}
	});
}

/* Portals */
function setPortals() {
	var mapBounds = map.getBounds();

	var url = '/showData/portals-data/bounds?north=' + mapBounds.north() + '&south=' + mapBounds.south() + '&east=' + mapBounds.east() + '&west=' + mapBounds.west();
	$.getJSON(url, function (data) {
		$(data).each(function (index, item) {
			setPortalMarker(item.id, item.Name, item.Latitude, item.Longitude, item.Mark);
			setPortalInfoWin(item.id, item.Name, item.Mark);
		});

		var marker, infowindow;
		for (var i in portals) {
			marker = portals[i];
			infowindow = portalInfoWins[i];
			setPortalEvent(marker, infowindow);
		}
	});
}

function resetPortals() {
	resetPortalEvents();
	hideAllMarkers(portals);

	portals = [];
	portalInfoWins = [];

	pokestops = [];
	gyms = [];
	neithers = [];
}

function resetPortalEvents() {
	naver.maps.Event.removeListener(portalEventListeners);
    portalEventListeners = [];
}

function setPortalMarker(id, name, latitude, longtitude, mark) {
	if(mark == 'neither') {
        var marker = new naver.maps.Marker({position: new naver.maps.LatLng(latitude, longtitude)});
        neithers.push(marker);
    }
    else if(mark == 'gym') {
        var markerOptions = {
        	map: map,
            position: new naver.maps.LatLng(latitude, longtitude),
            title: id + '. ' + name,
            icon: {
                url: '/images/gym.png',
                anchor: new naver.maps.Point(19, 40)
            }
        }

        var marker = new naver.maps.Marker(markerOptions);
        gyms.push(marker);
    }
    else {
        var markerOptions = {
        	map: map,
            position: new naver.maps.LatLng(latitude, longtitude),
            title: id + '. ' + name,
            icon: {
                url: '/images/pokestop.png',
                anchor: new naver.maps.Point(19, 40)
            }
        }

        var marker = new naver.maps.Marker(markerOptions);
        pokestops.push(marker);
    }

    portals.push(marker);
    return marker;
}

function setPortalInfoWin(id, name, mark) {
	var infowindow = new naver.maps.InfoWindow({
        content: '<h4>' + mark +'</h4><h5><strong>' + id + '. ' + name + '</strong><br /><p class="text-right"><small><a href="/showdata/edit/' + id +'"> 정보 수정하기</a>' + '</small></p></h5>'
    });
    portalInfoWins.push(infowindow);
    return infowindow;
}

function setPortalEvent(marker, infowindow) {
	var listener = naver.maps.Event.addListener(marker, "click", function(e) {
        if (infowindow.getMap()) {
	        infowindow.close();
	    } else {
	        infowindow.open(map, marker);
	    }
    });

    naver.maps.Event.addListener(marker, "mouseover", function() {
        infowindow.open(map, marker);
    });

	portalEventListeners.push(listener);
    return listener;
}

function hideAllMarkers(markers) {
    for (var i in markers) {
        var marker = markers[i];
    	marker.setMap(null);
    }
}

/* Search menu & Search mark */
function setSearchMenu() {
    var search = $('#search').val();
    if(search != '') {
        resetSearchMenu();

        var url = '/search/naverSearch/' + search;
        $.getJSON(url , function (data) {
            var total = data.display;
            var ouput_total = '<li class="list-group-item"><strong><mark>' + search + '</mark> 검색결과 ' + total + '건</strong></li>'
            $(ouput_total).appendTo('#search-menu');

            if(total != 0) {
                var location = naver.maps.TransCoord.fromTM128ToLatLng(new naver.maps.Point(data.items[0].mapx, data.items[0].mapy));
                map.setCenter(location);

                var seq=0;
                $(data.items).each(function (index, item) {
                    var link = 'javascript:searchMarkerOnClickSetCenter(' + seq + ')';
                    var output = '<a href="' + link + '"' + 'class="list-group-item">' + '<strong>' + (seq+1) + '. ' + item.title + '</strong>' + '<br />' + item.category + '<br />' + '<small>' + item.address + '</small>' + '</a>';
                    $(output).appendTo('#search-menu');

                    setSearchMarker(seq+1, item.title, item.mapx, item.mapy);
                    setSearchMarkerInfoWin(seq+1, item.title, item.category);
                    setSearchMarkerEvent(seq);
                    seq++;
                });

                var circle = updateCircle(location);
                var cnt = countNearPokestop(circle.getBounds());
                var infowindow_search = searchMarkerInfowins[0];
                var content = '<h5>' + infowindow_search.getContent() + '<br/><br/><mark>주변 포켓스탑: ' + cnt + '</mark></h5>';

                var infowindow = new naver.maps.InfoWindow();
                infowindow.setContent(content);
                infowindow.open(map, searchMarkers[0]);
            }

            $('#search-menu').collapse('show');
        });
    }
    else {
        alert('검색어를 입력하세요');
    }
}

function resetSearchMenu() {
	$('#search-menu').empty();
	resetPortalEvents();
	hideAllMarkers(searchMarkers);

	searchMarkers = [];
	searchMarkerInfowins = [];
}

function resetSearchMenuEvents() {
	naver.maps.Event.removeListener(searchMarkerEventListeners);
    searchMarkerEventListeners = [];
}

function setSearchMarker(id, name, mapx, mapy) {
    var location = naver.maps.TransCoord.fromTM128ToLatLng(new naver.maps.Point(mapx, mapy));
    
    var markerOptions = {
        position: location,
        map: map,
        title: id + '. ' + name
    }
    var marker = new naver.maps.Marker(markerOptions);

    searchMarkers.push(marker);
    return marker;
}

function setSearchMarkerInfoWin(id, title, category) {
    var infowindow = new naver.maps.InfoWindow({
        content: '<strong>' + id + '. ' + title + '</strong> <br />' + category
    });
    searchMarkerInfowins.push(infowindow);
    return infowindow;
}

function setSearchMarkerEvent(seq) {
	var marker, position;

    marker = searchMarkers[seq];
    position = marker.getPosition();

    var listener = naver.maps.Event.addListener(marker, "click", function(e) {
        var circle = updateCircle(position);
        var cnt = countNearPokestop(circle.getBounds());
        var infowindow_search = searchMarkerInfowins[seq];
    	var content = '<h5>' + infowindow_search.getContent() + '<br/><br/><mark>주변 포켓스탑: ' + cnt + '</mark></h5>';

    	var infowindow = new naver.maps.InfoWindow();
	    infowindow.setContent(content);
	    infowindow.open(map, marker);
    });

    searchMarkerEventListeners.push(listener);
    return listener;
}

function searchMarkerOnClickSetCenter(seq) {
    var marker, position;

    marker = searchMarkers[seq];
    position = marker.getPosition();

    var circle = updateCircle(position);
    map.setCenter(position);

    var cnt = countNearPokestop(circle.getBounds());
    var infowindow_search = searchMarkerInfowins[seq];
    var content = '<h5>' + infowindow_search.getContent() + '<br/><br/><mark>주변 포켓스탑: ' + cnt + '</mark></h5>';

    var infowindow = new naver.maps.InfoWindow();
    infowindow.setContent(content);
    infowindow.open(map, marker);
}

/* Circle */
function drawCircle(center) {
    var circle = new naver.maps.Circle({
        map: map,
        center: center,
        radius: 41,
        fillColor: 'yellowgreen',
        fillOpacity: 0.3
    });

    return circle;
}

function updateCircle(position) {
    circle.setCenter(position);

    return circle;
}

function countNearPokestop(bounds) {
    var cnt=0;
    for(var i in pokestops) {
        if(bounds.hasLatLng(pokestops[i].getPosition() )) {
            cnt++;
        }
    }

    return cnt;
}