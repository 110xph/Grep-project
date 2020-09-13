#!/bin/bash
while [ true ] 
do
    /bin/sleep 1
    result=`psql "host=localhost port=5301 user=postgres password=postgres dbname=$1" << EOF
        SELECT SUM(xact_commit)FROM pg_stat_database;
EOF`
    echo $result
done