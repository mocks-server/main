#!/bin/bash

REPORT=$(pnpm run affected:check:report -- --format=html --prepend "|" --base $1 | tr '\n' ' ');

IFS='|';
read REPORT_TRACES REPORT_PARAM REPORT_RESULT <<< "$REPORT"
unset IFS;

echo "$REPORT_RESULT"
