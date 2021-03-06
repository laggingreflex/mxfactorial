#!/bin/bash
BUILD_SUBDIR=$1
# search for commits through prior 6 successful builds when latest unavailable
last_available_commit() {
  i=1
  while [[ $LAST_SUCCESSFUL_BUILD_COMMIT == "null" ]] || [[ $i -lt 7 ]]
  do
    LAST_SUCCESSFUL_BUILD_NUMBER=$(curl -s https://circleci.com/api/v1.1/project/github/systemaccounting/mxfactorial/tree/${CIRCLE_BRANCH}?circle-token=${CI_API_TOKEN} | \
    jq -r 'map(select(.workflows.job_name == '\"$CIRCLE_JOB\"' and .outcome == "success")) | nth('$i').build_num')
    echo "Build number from attempt #$i to retrieve prior successful build: $LAST_SUCCESSFUL_BUILD_NUMBER"
    LAST_SUCCESSFUL_BUILD_COMMIT=$(curl -s https://circleci.com/api/v1.1/project/github/systemaccounting/mxfactorial/$LAST_SUCCESSFUL_BUILD_NUMBER?circle-token=$CI_API_TOKEN | \
    jq -r '.all_commit_details | first | .commit')
    echo "Commit hash from attempt #$i to retrieve commit from prior successful build: $LAST_SUCCESSFUL_BUILD_COMMIT"
    EXISTS_IN_CURRENT_BRANCH=$(git log | grep "$LAST_SUCCESSFUL_BUILD_COMMIT")
    if [[ $LAST_SUCCESSFUL_BUILD_COMMIT == "null" ]] || [[ -z $EXISTS_IN_CURRENT_BRANCH ]]; then
      let "i+=1"
    else
      break
    fi
  done
}

# get last successful build number of branch
echo "Current CircleCI job: $CIRCLE_JOB"
set +e
LAST_SUCCESSFUL_BUILD_NUMBER=$(curl -s https://circleci.com/api/v1.1/project/github/systemaccounting/mxfactorial/tree/${CIRCLE_BRANCH}?circle-token=${CI_API_TOKEN} | \
jq -r 'map(select(.workflows.job_name == '\"$CIRCLE_JOB\"' and .outcome == "success")) | first.build_num')
echo "Last successful build: $LAST_SUCCESSFUL_BUILD_NUMBER"
if [[ $LAST_SUCCESSFUL_BUILD_NUMBER == "null" ]]; then
  # get initial commit after branching from develop or master if no previous successful build number
  if [[ $CIRCLE_BRANCH != "develop" && $CIRCLE_BRANCH != "master" ]]; then
    echo "Current branch: $CIRCLE_BRANCH"
    CHANGED_SUBDIR=$(git log --name-only --oneline origin/develop..$CIRCLE_BRANCH | sed -E '/^[a-f0-9]{7}/d' | sed '/^\.circleci/d' | sort -u)
  else
    # use previous commit sha if develop or master and no previous success build number (in case someone git inits this script)
    CHANGED_SUBDIR=$(git log --name-only --oneline -1 | sed -E '/^[a-f0-9]{7}/d' | cut -d/ -f1 | sort -u)
    if [[ $CHANGED_SUBDIR == '.circleci' ]]; then
      exit 0
    fi
  fi
  # exit if subdirectory name ($BUILD_SUBDIR) excluded from subdirectories affected by latest commit
  echo "Directories affected when no previous successful build available: $CHANGED_SUBDIR"
  if  [[ -z $CHANGED_SUBDIR ]]; then
    echo "halting after detecting 0 changes"
      circleci step halt
  elif [[ $CHANGED_SUBDIR == '.circleci' ]]; then
    exit 0
  elif [[ $CHANGED_SUBDIR != *'/'* ]]; then
    echo "halting after detecting changes to root files only"
    circleci step halt
  elif [[ $CHANGED_SUBDIR != *$BUILD_SUBDIR* ]]; then
    echo "halting after $BUILD_SUBDIR not in $CHANGED_SUBDIR"
    circleci step halt
  else
    exit 0
  fi
fi

# get commit sha of last successful build number on branch
LAST_SUCCESSFUL_BUILD_COMMIT=$(curl -s https://circleci.com/api/v1.1/project/github/systemaccounting/mxfactorial/$LAST_SUCCESSFUL_BUILD_NUMBER?circle-token=$CI_API_TOKEN | \
jq -r '.all_commit_details | first | .commit')
if [[ $LAST_SUCCESSFUL_BUILD_COMMIT == "null" ]]; then
  echo "circleci returning empty all_commit_details for last successful build. searching for commits from 6 prior successful builds."
  last_available_commit
  if [[ $LAST_SUCCESSFUL_BUILD_COMMIT == "null" ]]; then
    echo "0 commits found from 6 previous successful builds. halting build after detecting absent history."
    circleci step halt
  fi
fi
echo "Last successful build commit: $LAST_SUCCESSFUL_BUILD_COMMIT"
# get subdirectories affected by range of commits since last successful build
CHANGED_SUBDIR=$(git log --name-only --oneline $LAST_SUCCESSFUL_BUILD_COMMIT..$CIRCLE_SHA1 | sed -E '/^[a-f0-9]{7}/d' | cut -d/ -f1 | sort -u)
echo "Directories affected since previous successful build of $CIRCLE_JOB job: $CHANGED_SUBDIR"
# exit if project passed as argument excluded from list of subdirectories affected by range of commits since last successful build
if [[ -z $CHANGED_SUBDIR ]]; then
  echo "halting after detecting 0 changes"
  circleci step halt
elif [[ $CHANGED_SUBDIR == '.circleci' ]]; then
  exit 0
elif [[ $CHANGED_SUBDIR == *'.'* && $CHANGED_SUBDIR != *'.circleci'* ]]; then
  echo "halting after detecting changes to root files only"
  circleci step halt
elif [[ $CHANGED_SUBDIR != *$BUILD_SUBDIR* ]]; then
  echo "halting after $BUILD_SUBDIR not in $CHANGED_SUBDIR"
else
  exit 0
fi