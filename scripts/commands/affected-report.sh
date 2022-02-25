#!/bin/bash

REPORT=$(pnpm run affected:report | tr '\n' ' ');

IFS='|';
read REPORT_TRACES REPORT_RESULT <<< "$REPORT"
unset IFS;

echo "$REPORT_RESULT"
