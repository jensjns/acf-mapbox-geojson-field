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
                    marker: true,
                    circle: false,
                    rectangle: {
                        shapeOptions: {
                            color: '#000000',
                        },
                    },
                },
                edit: {
                    featureGroup: editableLayer,
                    edit: false,
                    remove: false,
                },
            }).addTo(map);

            var sidebar = initialize_sidebar( $el, map, editableLayer );

            map.on('draw:created', function(e) {
                    editableLayer.addLayer(e.layer);
                    sidebar.addLayerControl(e.layerType, e.layer);
                })
                .on('draw:created draw:edited draw:deleted sidebareditor:edited sidebareditor:deleted', function(e) {
                    setValue(JSON.stringify(editableLayer.toGeoJSON()));
                })
                .on('mouseover', function(e) {
                    if(!sidebar.hasBounced && !sidebar.isOpen) {
                        sidebar.bounce();
                    }
                });

            editableLayer.eachLayer(function(layer) {
                var type = false;

                switch(layer.feature.geometry.type) {
                    case 'Point':
                        type = 'marker';
                        break;
                    case 'LineString':
                        type= 'polyline';
                        break;
                    case 'Polygon':
                        type = 'polygon';
                        break;
                }

                if( type ) {
                    var control = sidebar.addLayerControl(type, layer);
                    layer.on('click', function(e) {
                        sidebar.open();
                        control.enable();
                    });
                }
            });
        }
        else {
            // TODO: display an error in mapDOM
            console.log('mapbox-geojson-err-1');
        }

    }

    function initialize_sidebar( $el, map, featureGroup ) {
        var sidebarDOM = $el.find('.mbgs');
        var toggle = sidebarDOM.find('.mbgs-toggle');

        var sidebar = {
            domref: sidebarDOM,
            body: sidebarDOM.find('.mbgs-body'),
            isOpen: sidebarDOM.hasClass('mbgs-open'),
            map: map,
            featureGroup: featureGroup,
            hasBounced: false,
            bounce: function() {
                this.hasBounced = true;
            },
            toggle: function() {
                this.domref.toggleClass('mbgs-open');
                this.isOpen = this.domref.hasClass('mbgs-open');

                if(!this.isOpen) {
                    this._disableEditing();
                    this.body.find('.mbgs-tray-item-active').removeClass('mbgs-tray-item-active');
                }
            },
            close: function() {
                this.domref.removeClass('mbgs-open');
                this.isOpen = false;
                this._disableEditing();
                this.body.find('.mbgs-tray-item-active').removeClass('mbgs-tray-item-active');
            },
            open: function() {
                this.domref.addClass('mbgs-open');
                this.isOpen = true;
            },
            _disableEditing: function() {
                this.layerControls.forEach(function(control) {
                    control._control.removeClass('mbgs-tray-item-active');
                    control._disableEdit();
                });
            },
            _panTo: function(latLng) {
                if( this.isOpen ) {
                    var targetPoint = this.map.project(latLng).add([250 / 2, 0]);
                    var targetLatLng = map.unproject(targetPoint);
                    this.map.panTo(targetLatLng);
                }
                else {
                    this.map.panTo(latLng);
                }
            },
            _createTrayItem: function(type) {
                var trayItem = '';
                trayItem += '<div class="mbgs-tray-item">';
                trayItem += '   <a href="#" class="mbgs-tray-item-header">';
                trayItem += '       <span class="ld-icon ld-icon-' + type + '"></span>';
                trayItem += '       <span>' + type + '</span>';
                trayItem += '       <span class="mbgs-delete-feature ld-icon ld-icon-trashcan"></span>';
                trayItem += '   </a>';
                trayItem += '</div>';

                return $(trayItem);
            },
            addLayerControl: function(layerType, layer) {
                var sidebar = this;

                var layerControl = {
                    type: layerType,
                    layer: layer,
                    map: sidebar.map,
                    sidebar: sidebar,
                    enabled: false,
                    enable: function() {
                        this.sidebar._disableEditing();
                        this._enableEdit();
                        this._control.addClass('mbgs-tray-item-active');
                        this.enabled = true;
                    },
                    disable: function() {
                        this._disableEdit();
                        this._control.removeClass('mbgs-tray-item-active');
                        this.enabled = false;
                    },
                    toggle: function() {
                        this._control.toggleClass('mbgs-tray-item-active');

                        if( this.enabled ) {
                            this.disable();
                        }
                        else {
                            this.enable();
                        }
                    },
                    _control: null,
                    _enableEdit: function(){},
                    _disableEdit: function(){},
                    _init: function() {
                        var self = this;

                        if( self.type == 'marker' ) {
                            self.layer.on('dragend', function(e) {
                                self.map.fire('sidebareditor:edited', self.layer);
                            });

                            self._enableEdit = function() {
                                self.sidebar._panTo(self.layer.getLatLng());
                                self.layer.dragging.enable();
                            };
                            self._disableEdit = function() {
                                self.layer.dragging.disable();
                            };
                        }
                        else if(['polyline', 'polygon', 'rectangle'].indexOf(self.type) > -1) {
                            self.layer.on('edit', function(e) {
                                self.map.fire('sidebareditor:edited', self.layer);
                            });
                            self.type = (self.type == 'rectangle') ? 'polygon' : self.type;
                            self._enableEdit = function() {
                                self.sidebar._panTo(self.layer.getBounds().getCenter());
                                self.layer.editing.enable();
                            };
                            self._disableEdit = function() {
                                self.layer.editing.disable();
                            };
                        }

                        var control = self.sidebar._createTrayItem(self.type);
                        self.sidebar.body.append(control);
                        self._control = control;

                        control.find('.mbgs-tray-item-header').on('click', function(e) {
                            self.sidebar._disableEditing();
                            var clickedTrayItem = $(this).parent('.mbgs-tray-item');
                            clickedTrayItem.toggleClass('mbgs-tray-item-active');

                            if( clickedTrayItem.hasClass('mbgs-tray-item-active') ) {
                                self._enableEdit();
                            }
                        });

                        control.find('.mbgs-delete-feature').on('click', function(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            self.sidebar.featureGroup.removeLayer(layer);
                            control.remove();
                            self.map.fire('sidebareditor:deleted', layer);
                        });

                        return self;
                    }
                };

                var initialized = layerControl._init();
                sidebar.layerControls.push(initialized);
                return initialized;
            },
            layerControls: [],
        };

        toggle.on('click', function(e) {
            sidebar.toggle();
        });

        return sidebar;
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
