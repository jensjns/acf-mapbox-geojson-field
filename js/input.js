(function($){

    function initialize_field( $el ) {

        var mapDOM = $el.find('.mapbox-geojson-map');
        var inputField = $el.find('.mapbox-geojson-field');

        var settings = {
            accessToken: mapDOM.attr('data-access-token'),
            mapId: mapDOM.attr('data-map-id'),
        };

        var setValue = function(value) {
            $(inputField).val(value);
        };

        var jsonData = {
            type: "FeatureCollection",
            features: [],
        };

        try {
            var existingData = JSON.parse($(inputField).val());
            jsonData = existingData
        } catch (err) {
            setValue(JSON.stringify(jsonData));
        }

        if( settings.accessToken && settings.mapId ) {

            var map = L.mapbox.map(mapDOM[0], settings.mapId, settings);

            var editableLayer = L.mapbox.featureLayer(jsonData, settings).addTo(map);

            if( jsonData.features.length ) {
                map.fitBounds(editableLayer.getBounds());
            }
            else {
                map.setView([0, 0], 1);
            }

            var drawControl = new L.Control.Draw({
                draw: {
                    polyline: {
                        shapeOptions: {
                            color: '#000000',
                        },
                    },
                    polygon: {
                        shapeOptions: {
                            color: '#000000',
                        },
                    },
                    circle: false,
                    rectangle: {
                        shapeOptions: {
                            color: '#000000',
                        },
                    },
                    marker: true,
                },
                edit: {
                    featureGroup: editableLayer,
                },
            }).addTo(map);

            map.on('draw:created', function(e) {
                    editableLayer.addLayer(e.layer);
                })
                .on('draw:created draw:edited draw:deleted', function(e) {
                    setValue(JSON.stringify(editableLayer.toGeoJSON()));
                });
        }
        else {
            // TODO: display an error in mapDOM
            console.log('mapbox-geojson-err-1');
        }

    }


    if( typeof acf.add_action !== 'undefined' ) {

        /*
        *  ready append (ACF5)
        *
        *  These are 2 events which are fired during the page load
        *  ready = on page load similar to $(document).ready()
        *  append = on new DOM elements appended via repeater field
        *
        *  @type    event
        *  @date    20/07/13
        *
        *  @param   $el (jQuery selection) the jQuery element which contains the ACF fields
        *  @return  n/a
        */

        acf.add_action('ready append', function( $el ){

            // search $el for fields of type 'mapbox_geojson'
            acf.get_fields({ type : 'mapbox_geojson'}, $el).each(function(){

                initialize_field( $(this) );

            });

        });


    } else {


        /*
        *  acf/setup_fields (ACF4)
        *
        *  This event is triggered when ACF adds any new elements to the DOM.
        *
        *  @type    function
        *  @since   1.0.0
        *  @date    01/01/12
        *
        *  @param   event       e: an event object. This can be ignored
        *  @param   Element     postbox: An element which contains the new HTML
        *
        *  @return  n/a
        */

        $(document).on('acf/setup_fields', function(e, postbox){

            $(postbox).find('.field[data-field_type="mapbox_geojson"]').each(function(){

                initialize_field( $(this) );

            });

        });


    }


})(jQuery);
