=== Advanced Custom Fields: Mapbox geoJSON Field ===
Contributors: jensnilsson
Tags: Advanced Custom Fields, acf, acf5, custom fields, admin, wp-admin, map, mapbox, map-markers, mapping, geojson
Requires at least: 4.0
Tested up to: 4.2
Stable tag: trunk
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Addon for Advanced Custom Fields that adds a Mapbox geoJSON field to the available field types.

== Description ==

This plugin adds a [Mapbox](https://www.mapbox.com/)-driven geoJSON-field to the [Advanced Custom Fields](http://www.advancedcustomfields.com/) plugin. Use it to store and manage geoJSON-data along with your posts and pages.

* Add multiple markers.
* Draw polylines, polygons and rectangles.
* Supports ACF4 and ACF5 (Pro)

= Data =

The data the field produces is formatted according to the [geoJSON spec](http://geojson.org/geojson-spec.html).

= Rendering =

This plugin does not handle rendering of the data on your frontend in any way. Most of the popular mapping-libraries supports importing geoJSON-formatted data directly via their respective API's.

= Compatibility =

This ACF field type is compatible with:

* ACF 5
* ACF 4

= GitHub =

If you want the latest development version of this plugin it is available over at my [github repository](https://github.com/jensjns/acf-mapbox-geojson-field/). The github repository will always have the latest code but may occasionally be broken and not work at all.

== Installation ==

1. Copy the `acf-mapbox_geojson` folder into your `wp-content/plugins` folder
1. Make sure you have [Advanced Custom Fields](http://www.advancedcustomfields.com/) installed and activated
1. Activate the Mapbox geoJSON plugin via the plugins admin page
1. Sign up for the free plan over at [Mapbox](https://www.mapbox.com/) to get an access token and a map ID
1. Create a new field via ACF and select the Mapbox geoJSON type
1. Enter your access token and map ID that you can find on your projects page at Mapbox

== Changelog ==

= 0.0.3 =
* Added sidebar for selecting and deleting features

= 0.0.2 =
* ACF 4 support

= 0.0.1 =
* Initial Release.