<?php

namespace App\Http\Controllers;

use App\ApiRequest;
use App\ApiRequestParameters;

use App\Http\Requests;

class AjaxController extends Controller
{

    /**
    * Load the dashboard's layout
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function postLoadLayout()
    {
        $source_json = json_decode( file_get_contents( base_path() . '/config/dashboard.json', true ) );
        return response()->json( [ 'layout' => base64_decode( $source_json->layout ) ] );
    }

    /**
    * Internal method used to generate a base64-encoded Gridster layout
    */
    public function getEncodeLayout()
    {
        $layout = '[{"col":1,"row":1,"size_x":1,"size_y":1},{"col":1,"row":2,"size_x":1,"size_y":1},{"col":1,"row":3,"size_x":1,"size_y":1},{"col":2,"row":1,"size_x":2,"size_y":1},{"id":"bigGraph","col":2,"row":2,"size_x":2,"size_y":2},{"col":4,"row":1,"size_x":1,"size_y":1},{"col":4,"row":2,"size_x":2,"size_y":1},{"col":4,"row":3,"size_x":1,"size_y":1},{"col":5,"row":1,"size_x":1,"size_y":1},{"col":5,"row":3,"size_x":1,"size_y":1},{"col":6,"row":1,"size_x":1,"size_y":1},{"col":6,"row":2,"size_x":1,"size_y":2},{"id":"footerWidget","col":1,"row":4,"size_x":6,"size_y":1}]';
        echo base64_encode( $layout );
    }

    /**
    * Save the current layout to the JSON configuration file
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function postSaveToJson()
    {
        $layout = base64_encode( $_POST[ '_serialized' ] );
        $fullJson = json_encode( [ 'version' => '1.0', 'layout' => $layout ] );
        $file = base_path() . '/config/dashboard.json';
        file_put_contents( $file, $fullJson );
        return response()->json( [ 'result' => 0 ] );
    }

    /**
    * Return the dashboard to the default, before any changes are made
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function postLoadDefault()
    {
        $layout = file_get_contents( base_path() . '/resources/install/dashboard-default.json' );
        // [{"id":"c1r1","col":1,"row":1,"size_x":1,"size_y":1},{"id":"ec42","col":2,"row":1,"size_x":2,"size_y":1},{"id":"e419","col":4,"row":1,"size_x":1,"size_y":1},{"id":"527a","col":5,"row":1,"size_x":1,"size_y":1},{"id":"7d7d","col":6,"row":1,"size_x":1,"size_y":1},{"id":"e6f5","col":1,"row":2,"size_x":1,"size_y":1},{"id":"bigGraph","col":2,"row":2,"size_x":2,"size_y":2},{"id":"9eb2","col":4,"row":2,"size_x":2,"size_y":1},{"id":"d683","col":6,"row":2,"size_x":1,"size_y":2},{"id":"be8e","col":1,"row":3,"size_x":1,"size_y":1},{"id":"1adb","col":4,"row":3,"size_x":1,"size_y":1},{"id":"9035","col":5,"row":3,"size_x":1,"size_y":1},{"id": "footerWidget","col": 1,"row": 4,"size_x": 6,"size_y": 1}]
        return response()->json( [ 'layout' => $layout ] );
    }

    public function postClusterInfo()
    {
        $parameters = [ 'username' => $_POST[ '_username' ], 'password' => $_POST[ '_password' ], 'cvmAddress' => $_POST[ '_cvmAddress' ], 'objectPath' => 'cluster' ];

        $results = ( new ApiRequest( new ApiRequestParameters( $parameters ) ) )->doApiRequest( null, 'GET' );

        return response()->json( [ 'results' => $results ] );

    }

    public function postVmInfo()
    {
        $parameters = [ 'username' => $_POST[ '_username' ], 'password' => $_POST[ '_password' ], 'cvmAddress' => $_POST[ '_cvmAddress' ], 'objectPath' => 'vms' ];

        $vms = ( new ApiRequest( new ApiRequestParameters( $parameters ) ) )->doApiRequest();

        $vmCount = $vms[ 'metadata' ][ 'grand_total_entities' ];

        return response()->json( [ 'vmCount' => $vmCount ] );
    }

    public function postPhysicalInfo()
    {
        $parameters = [ 'username' => $_POST[ '_username' ], 'password' => $_POST[ '_password' ], 'cvmAddress' => $_POST[ '_cvmAddress' ], 'objectPath' => 'hosts' ];

        $physical = ( new ApiRequest( new ApiRequestParameters( $parameters ) ) )->doApiRequest();

        $hostCount = $physical[ 'metadata' ][ 'grand_total_entities' ];

        $hostSerials = '';

        foreach( $physical[ 'entities' ] as $host )
        {
            $hostSerials = $hostSerials . 'S/N&nbsp;' . $host[ 'serial' ] . '<br>';
        }

        return response()->json( [ 'hostCount' => $hostCount, 'hostSerials' => $hostSerials ] );
    }

    public function postContainerInfo()
    {

        // sample request
        // https://<cvm_ip>:9440/PrismGateway/services/rest/v1/containers/000525e7-9471-11ec-1830-d8cb8ac3e5bf::1585/stats/?metrics=controller_avg_io_latency_usecs&startTimeInUsecs=1450863555000000&endTimeInUsecs=1450867155000000&interval=30

        $parameters = [ 'username' => $_POST[ '_username' ], 'password' => $_POST[ '_password' ], 'cvmAddress' => $_POST[ '_cvmAddress' ], 'objectPath' => 'storage_containers' ];

        $containers = ( new ApiRequest( new ApiRequestParameters( $parameters ) ) )->doApiRequest();

        $firstContainerId = $containers[ 'entities' ][ 0 ][ 'id' ];
        $containerCount = $containers[ 'metadata' ][ 'grand_total_entities' ];

        $parameters = [
            'username' => $_POST[ '_username' ],
            'password' => $_POST[ '_password' ],
            'topLevelPath' => 'PrismGateway/services/rest/v1',
            'objectPath' => 'containers',
            'objectId' => $firstContainerId,
            'objectSubPath' => 'stats',
            'metric' => 'controller_avg_io_latency_usecs',
            'cvmAddress' => $_POST[ '_cvmAddress' ],
            'cvmPort' => '9440',
            'connectionTimeout' => 3,
            'method' => 'GET',
            'startTime' => \Carbon\Carbon::now()->subHour(4),
            'endTime' => \Carbon\Carbon::now(),
            'interval' => 30
        ];

        $results = ( new ApiRequest( new ApiRequestParameters( $parameters ) ) )->doApiRequest();

        return response()->json( [ 'containerCount' => $containerCount, 'stats' => [ $results[ 'statsSpecificResponses' ][0][ 'values' ] ] ] );

    }

}