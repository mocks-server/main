#!/bin/bash

REPORT=$(pnpm run projects:target:print:array -- --prepend "|" --target $1 | tr '\n' ' ');

IFS='|';
read REPORT_TRACES REPORT_PARAM REPORT_RESULT <<< "$REPORT"
unset IFS;

echo "$REPORT_RESULT"
