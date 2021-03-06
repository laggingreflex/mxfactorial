#!/bin/bash
ENV=$1
ARTIFACT_TYPE=$2

CURRENT_DIR=$(pwd)
for dir in */; do
  echo "Deploying from $CURRENT_DIR/$dir"
  cd $CURRENT_DIR/$dir && . deploy.sh $ENV ${ARTIFACT_TYPE:-src}
done

# cherry-pick by commenting lines 3-5 above, then commenting below in
# DEPLOYING=$'rules-faas/\ntransact-faas/\ngraphql-faas/'
# for dir in $DEPLOYING; do
#   cd $CURRENT_DIR/$dir && . deploy.sh $ENV
# done