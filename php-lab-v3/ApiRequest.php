<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiRequest extends Model
{
    use HasFactory;

    /**
    * The parameters to use while processing the request
    *
    * @var ApiRequestParameters
    */
    var $parameters;

    /**
    * ApiRequest constructor.
    *
    * @param ApiRequestParameters $parameters
    */
    public function __construct(ApiRequestParameters $parameters)
    {
        $this->parameters = $parameters;
        return $this;
    }

    /**
    * Process an API request
    * Supports both GET and POST requests
    *
    * @param $postParameters
    * @return mixed
    */
    public function doApiRequest($postParameters = null)
    {

        $path = '';
        switch ($this->parameters->method) {
            case 'GET':

                if (isset($this->parameters->objectId)) {
                    $path = sprintf(
                        "https://%s:%s/%s/%s/%s/%s?metrics=%s&startTimeInUsecs=%s&endTimeInUsecs=%s",
                        $this->parameters->cvmAddress,
                        $this->parameters->cvmPort,
                        $this->parameters->topLevelStatsPath,
                        $this->parameters->objectPath,
                        $this->parameters->objectId,
                        $this->parameters->objectSubPath,
                        $this->parameters->metric,
                        \Carbon\Carbon::parse($this->parameters->startTime)->timestamp * 1000000,
                        \Carbon\Carbon::parse($this->parameters->endTime)->timestamp * 1000000
                    );
                } else {
                    $path = sprintf(
                        "https://%s:%s/%s/%s/",
                        $this->parameters->cvmAddress,
                        $this->parameters->cvmPort,
                        $this->parameters->topLevelPath,
                        $this->parameters->objectPath
                    );
                }
                break;
            case 'POST':
                $path = sprintf(
                    "https://%s:%s/%s/%s",
                    $this->parameters->cvmAddress,
                    $this->parameters->cvmPort,
                    $this->parameters->topLevelPath,
                    $this->parameters->objectPath
                );
                break;
        }

        $client = new \GuzzleHttp\Client();

        $response = $client->request(
            $this->parameters->method,
            $path,
            [
                'auth' => [ $this->parameters->username, $this->parameters->password ],
                'verify' => false,
                'connect_timeout' => $this->parameters->connectionTimeout,
                'read_timeout' => $this->parameters->connectionTimeout,
                'timeout' => $this->parameters->connectionTimeout,
                'headers' => [
                    "Accept" => "application/json",
                    "Content-Type" => "application/json"
                ],
                'body' => $this->parameters->body
            ]
        );

        /* return the response data in JSON format */
        return (json_decode($response->getBody()));
    }
}
