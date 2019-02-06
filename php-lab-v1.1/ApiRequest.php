<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ApiRequest extends Model
{

    /**
    * The parameters to use while processing the request
    *
    * @var ApiRequestParameters
    */
    var $parameters;

    /**
    * ApiRequest constructor.
    * @param ApiRequestParameters $parameters
    */
    public function __construct( ApiRequestParameters $parameters )
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
    public function doApiRequest( $postParameters = null )
    {

        $path = '';
        switch( $this->parameters[ 'method' ] )
        {
            case 'GET':

                if( isset( $this->parameters[ 'objectId' ] ) )
                {
                    $path = sprintf( "https://%s:%s/%s/%s/%s/%s?metrics=%s&startTimeInUsecs=%s&endTimeInUsecs=%s",
                        $this->parameters[ 'cvmAddress' ],
                        $this->parameters[ 'cvmPort' ],
                        $this->parameters[ 'topLevelStatsPath' ],
                        $this->parameters[ 'objectPath' ],
                        $this->parameters[ 'objectId' ],
                        $this->parameters[ 'objectSubPath' ],
                        $this->parameters[ 'metric' ],
                        \Carbon\Carbon::parse( $this->parameters->startTime )->timestamp * 1000000,
                        \Carbon\Carbon::parse( $this->parameters->endTime )->timestamp * 1000000
                    );
                }
                else
                {
                    $path = sprintf( "https://%s:%s/%s/%s/",
                        $this->parameters[ 'cvmAddress' ],
                        $this->parameters[ 'cvmPort' ],
                        $this->parameters[ 'topLevelPath' ],
                        $this->parameters[ 'objectPath' ]
                    );
                }
                break;
            case 'POST':
                $path = sprintf( "https://%s:%s/%s/%s",
                    $this->parameters[ 'cvmAddress' ],
                    $this->parameters[ 'cvmPort' ],
                    $this->parameters[ 'topLevelPath' ],
                    $this->parameters[ 'objectPath' ]
                );
                break;
        }

        $client = new \GuzzleHttp\Client();

        $request = $client->createRequest(
            $this->parameters[ 'method' ],
            $path,
            [
                'config' => [
                    'curl' => [
                        CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
                        CURLOPT_USERPWD => $this->parameters[ 'username' ] . ':' . $this->parameters[ 'password' ],
                        CURLOPT_SSL_VERIFYHOST => false,
                        CURLOPT_SSL_VERIFYPEER => false
                    ],
                    'verify' => false,
                    'timeout' => $this->parameters[ 'connectionTimeout' ],
                    'connect_timeout' => $this->parameters[ 'connectionTimeout' ],
                ],
                'headers' => [
                    "Accept" => "application/json",
                    "Content-Type" => "application/json"
                ],
                'body' => json_encode( $postParameters )
            ]
        );

        $response = $client->send($request);

        /* return the response data in JSON format */
        return( $response->json() );

    }

}