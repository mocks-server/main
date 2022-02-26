#!/bin/bash

REPORT=$(pnpm run projects:print:array -- --prepend "|" | tr '\n' ' ');

IFS='|';
read REPORT_TRACES REPORT_PARAM REPORT_RESULT <<< "$REPORT"
unset IFS;

echo "$REPORT_RESULT"
