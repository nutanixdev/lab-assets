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
        $source_json = json_decode(file_get_contents(base_path() . '/config/dashboard.json', true));
        return response()->json(['layout' => base64_decode($source_json->layout)]);
    }

    /**
    * Internal method used to generate a base64-encoded Gridster layout
    */
    public function getEncodeLayout()
    {
        $layout = '[{"col":1,"row":1,"size_x":1,"size_y":1},{"col":1,"row":2,"size_x":1,"size_y":1},{"col":1,"row":3,"size_x":1,"size_y":1},{"col":2,"row":1,"size_x":2,"size_y":1},{"id":"bigGraph","col":2,"row":2,"size_x":2,"size_y":2},{"col":4,"row":1,"size_x":1,"size_y":1},{"col":4,"row":2,"size_x":2,"size_y":1},{"col":4,"row":3,"size_x":1,"size_y":1},{"col":5,"row":1,"size_x":1,"size_y":1},{"col":5,"row":3,"size_x":1,"size_y":1},{"col":6,"row":1,"size_x":1,"size_y":1},{"col":6,"row":2,"size_x":1,"size_y":2},{"id":"footerWidget","col":1,"row":4,"size_x":6,"size_y":1}]';
        echo base64_encode($layout);
    }

    /**
    * Save the current layout to the JSON configuration file
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function postSaveToJson()
    {
        $layout = base64_encode($_POST['_serialized']);
        $fullJson = json_encode(['version' => '1.0', 'layout' => $layout]);
        $file = base_path() . '/config/dashboard.json';
        file_put_contents($file, $fullJson);
        return response()->json(['result' => 0]);
    }

    /**
    * Return the dashboard to the default, before any changes are made
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function postLoadDefault()
    {
        $layout = file_get_contents(base_path() . '/resources/install/dashboard-default.json');
        return response()->json(['layout' => $layout]);
    }

    /**
    * Return a list of Prism Central managed entities, based on a specified entity identifier/name
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function postPcListEntities()
    {

        $entity = $_POST['_entity'];

        $body = [ 'kind' => $entity ];

        $parameters = [
            'username' => $_POST['_username'],
            'password' => $_POST['_password'],
            'cvmAddress' => $_POST['_cvmAddress'],
            'objectPath' => $entity . 's/list',
            'method' => 'POST',
            'body' => json_encode($body),
            'entity' => $entity
        ];

        $results = (new ApiRequest(new ApiRequestParameters($parameters)))->doApiRequest(null, 'POST');

        return response()->json(['results' => $results]);
    }

    /**
    *
    * Return some high level storage container performance stats
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function postContainerInfo()
    {

        /**
        * sample request shown below
        *
        * https://{cvm_ip}:9440/PrismGateway/services/rest/v1/containers/{container_uuid}/stats/?metrics={metric}&startTimeInUsecs={start_time}&endTimeInUsecs={end_time}&interval={interval_in_secs}
        *
        * Metric used below is controller_avg_io_latency_usecs
        *
        */

        $parameters = [
            'username' => $_POST['_username'],
            'password' => $_POST['_password'],
            'cvmAddress' => $_POST['_cvmAddress'],
            'objectPath' => 'clusters/list',
            'method' => 'POST',
            'body' => json_encode([
                'kind' => 'cluster'
            ]),
            'entity' => 'cluster'
        ];

        $clusters = (new ApiRequest(new ApiRequestParameters($parameters)))->doApiRequest();

        /**
         * get the cluster virtual IP of the first cluster managed by this prism central instance
         * in production you wouldn't do this, but it is used here to illustrate the collection of container stats
        */

        $cluster_ip = $clusters->entities[0]->status->resources->network->external_ip;

        /**
         * now that we have the first cluster's virtual IP, we can connect to that cluster and get the first container's stats
         * note that we are explicitly telling this request to use api/nutanix/v2.0 as the top level request path, vs the api/nutanix/v3 default
         */

        $parameters = [
            'username' => $_POST['_username'],
            'password' => $_POST['_password'],
            'cvmAddress' => $cluster_ip,
            'objectPath' => 'storage_containers',
            'method' => 'GET',
            'topLevelPath' => 'api/nutanix/v2.0'
        ];

        $containers = (new ApiRequest(new ApiRequestParameters($parameters)))->doApiRequest();

        /**
         * based on the results of the container list request, we can now request stats for the first container in the list
         * it's possible these requests could be considered 'expensive' due to three requests being required for stats, but in a demo
         * app it will work ok
         */

        $firstContainerId = $containers->entities[0]->id;

        /**
         * build the parameters for our main request that will get the container's stats
         */
        
        $parameters = [
            'username' => $_POST['_username'],
            'password' => $_POST['_password'],
            'cvmAddress' => $cluster_ip,
            'objectPath' => 'containers',
            'objectSubPath' => 'stats',
            'objectId' => $firstContainerId,
            'method' => 'GET',
            'topLevelPath' => 'PrismGateway/services/rest/v1',
            'startTime' => \Carbon\Carbon::now()->subHour(4),
            'endTime' => \Carbon\Carbon::now(),
            'interval' => 30,
            'metric' => 'controller_avg_io_latency_usecs'
        ];

        $stats = (new ApiRequest(new ApiRequestParameters($parameters)))->doApiRequest();

        /**
         * at this point we have up to 4 hours worth of average latency stats for the first storage container in the first cluster managed
         * by our specified prism central instance
         * we now need to return those stats and then use javascript to generate a visual chart
         */

        /***********************************************/

        return response()->json(['stats' => [$stats->statsSpecificResponses[0]->values]]);
    }
}
