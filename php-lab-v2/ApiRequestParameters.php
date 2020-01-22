<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ApiRequestParameters extends Model
{

    /**
    * The username to use during the connection
    */
    var $username;

    /**
    * The password to use during the connection
    */
    var $password;

    /**
    * The path for the top level API request
    */
    var $topLevelPath;

    /**
    * The IP address of the CVM
    */
    var $cvmAddress;

    /**
    * The port to connect on
    */
    var $cvmPort;

    /**
    * The timeout period i.e. how long to wait before the request is considered failed
    *
    * Note the connectTimeout value is used for connection, read and request timeout
    */
    var $connectionTimeout;

    /**
    * Is this a GET or POST request?
    */
    var $method;

    /**
    * The path to the main request e.g. containers, hosts
    */
    var $objectPath;

    /**
    * The ID of the object to make the request again
    */
    var $objectId;

    /**
    * The sub-path for the request, e.g. stats
    */
    var $objectSubPath;

    /**
    * The name of the metric to look at
    */
    var $metric;

    /**
    * The start time for the query
    */
    var $startTime;

    /**
    * The end time for the query
    */
    var $endTime;

    /**
    * The query interval e.g. 30 for every 30 seconds
    */
    var $interval;

    /**
    * The request body, if required
    */
    var $body;

    /**
    * The entity type to list, if that is the type of request being made
    */
    var $entity;

    /**
    * ApiRequestParameters constructor.
    * @param array $attributes
    */
    public function __construct(array $attributes)
    {
        $this->username = $attributes['username'];
        $this->password = $attributes['password'];
        $this->cvmAddress = $attributes['cvmAddress'];
        $this->cvmPort = isset($attributes['cvmPort']) ? $attributes['cvmPort'] : '9440';
        $this->topLevelStatsPath = isset($attributes['topLevelPath']) ? $attributes['topLevelPath'] : 'PrismGateway/services/rest/v1';
        $this->topLevelPath = isset($attributes['topLevelPath']) ? $attributes['topLevelPath'] : 'api/nutanix/v3';
        $this->connectionTimeout = isset($attributes['connectionTimeout']) ? $attributes['connectionTimeout'] : 5;
        $this->method = isset($attributes['method']) ? $attributes['method'] : 'GET';
        $this->objectPath = $attributes['objectPath'] != null ? $attributes['objectPath'] : null;
        $this->objectId = isset($attributes['objectId']) ? $attributes['objectId'] : null;
        $this->objectSubPath = isset($attributes['objectSubPath']) ? $attributes['objectSubPath'] : null;
        $this->metric = isset($attributes['metric']) ? $attributes['metric'] : null;
        $this->startTime = isset($attributes['startTime']) ? $attributes['startTime'] : null;
        $this->endTime = isset($attributes['endTime']) ? $attributes['endTime'] : null;
        $this->interval = isset($attributes['interval']) ? $attributes['interval'] : null;
        $this->body = isset($attributes['body']) ? $attributes['body'] : null;
        $this->entity = isset($attributes['entity']) ? $attributes['entity'] : null;
    }
}
