<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nutanix Dashboard</title>
    <link rel="stylesheet" type="text/css" href="/css/vendor/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/vendor/built-in.css" />
    <link rel="stylesheet" type="text/css" href="/css/vendor/jquery-ui.min.css" />
    <link rel="stylesheet" type="text/css" href="/css/vendor/jq.dropdown.min.css" />
    <link rel="stylesheet" type="text/css" href="/css/vendor/jq.gridster.css" />
    <link rel="stylesheet" type="text/css" href="/css/vendor/jq.jqplot.css" />
    <link rel="stylesheet" type="text/css" href="/css/ntnx.css" />
</head>

<body>

    <nav class="navbar navbar-default navbar-fixed-top main-nav">
        <div class="container-fluid">
            <div class="collapse navbar-collapse">

                <ul class="nav navbar-nav">

                    <li><a href="#">Home</a></li>
                    <li><a href="#" class="saveLayout">Save Layout</a></li>
                    <li><a href="#" class="defaultLayout">Revert to Default Layout</a></li>

                </ul>

                <form action="/" method="POST" class="navbar-form navbar-form-left">
                {!! Form::hidden( 'csrf_token', csrf_token(), [ 'id' => 'csrf_token' ] ) !!}
                <div class="form-group">
                    {!! Form::text( 'cvmAddress', null, [ 'id' => 'cvmAddress', 'class' => 'form-control', 'placeholder' => 'Prism Central IP' ] ) !!}
                    {!! Form::text( 'username', null, [ 'id' => 'username', 'class' => 'form-control', 'placeholder' => 'Prism Central Username' ] ) !!}
                    {!! Form::password( 'password', [ 'id' => 'password', 'class' => 'form-control', 'placeholder' => 'Prism Central Password' ] ) !!}
                    {!! Form::submit( 'Go!', [ 'id' => 'goButton', 'class' => 'btn btn-primary' ] ) !!}
                </div>
                </form>

            </div>
        </div>
    </nav>

    <div class="container" style="margin-top: 20px;">
        <div class="row">
            <div class="col-md-15">
                @include( 'vendor.flash.message' )
                <div class="container">
                    <div class="row">
                        <div class="col-md-15">

                            <div class="gridster">
                                <ul>
                                    {{-- The grid layout will end up here, once it is generated --}}
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div style="height: 70px; clear: both;">&nbsp;</div>

    <script src="/js/vendor/jquery-3.4.1.min.js"></script>
    <script src="/js/vendor/jq.dropdown.min.js"></script>
    <script src="/js/vendor/classie.min.js"></script>
    <script src="/js/vendor/ntnx-bootstrap.min.js"></script>
    <script src="/js/vendor/modernizr-custom.js"></script>
    <script src="/js/vendor/jquery.jqplot.min.js"></script>
    <script src="/js/vendor/jqplot.logAxisRenderer.js"></script>
    <script src="/js/vendor/jqplot.categoryAxisRenderer.js"></script>
    <script src="/js/vendor/jqplot.canvasAxisLabelRenderer.js"></script>
    <script src="/js/vendor/jqplot.canvasTextRenderer.js"></script>
    <script src="/js/vendor/jqplot.barRenderer.js"></script>
    <script src="/js/vendor/jquery.gridster.min.js"></script>
    <script src="/js/ntnx.js"></script>

</body>

</html>
