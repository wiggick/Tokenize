<?php
$search = $_REQUEST['search'];

$data = array(
    'ajax' => 'Ajax',
    'javascript' => 'Javascript',
    'php' => 'PHP',
    'delphi' => 'Delphi',
    'java' => 'Java',
    'bash' => 'Bash',
    'batch' => 'Batch',
    'pascal' => 'Pascal',
    'css' => 'Cascading stylesheets'
);

$result = array();

foreach($data as $index => $item)
{
    if(stristr($item, $search))
    {
        $result[$index] = $item;
    }
}

echo json_encode($result);