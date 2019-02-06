/**
* Load the main view
*
* @return mixed
*/
public function getIndex()
{

  $layout = '[{"col":1,"row":1,"size_x":1,"size_y":1},{"col":1,"row":2,"size_x":1,"size_y":1},{"col":1,"row":3,"size_x":1,"size_y":1},{"col":2,"row":1,"size_x":2,"size_y":1},{"col":2,"row":2,"size_x":2,"size_y":2},{"col":4,"row":1,"size_x":1,"size_y":1},{"col":4,"row":2,"size_x":2,"size_y":1},{"col":4,"row":3,"size_x":1,"size_y":1},{"col":5,"row":1,"size_x":1,"size_y":1},{"col":5,"row":3,"size_x":1,"size_y":1},{"col":6,"row":1,"size_x":1,"size_y":1},{"col":6,"row":2,"size_x":1,"size_y":2}]';

  $source_json = json_decode( file_get_contents( base_path() . '/config/dashboard.json', true ) );

  if( $source_json->version )
  {
    $layout = base64_decode( $source_json->layout );
  }
  else
  {
    $layout = null;
  }

  return view( 'home.index' )->with( 'data', [ 'layout' => $layout ] );

}
/* getIndex */