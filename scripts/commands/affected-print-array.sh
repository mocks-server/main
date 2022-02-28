#!/bin/bash

REPORT=$(pnpm run affected:print:array -- --prepend "|" --base $1 | tr '\n' ' ');

IFS='|';
read REPORT_TRACES REPORT_PARAM REPORT_RESULT <<< "$REPORT"
unset IFS;

echo "$REPORT_RESULT"
