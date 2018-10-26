## Tfstools

# Install

```npm install -g tfstools```

# Creating a repository

To create a repository with the given name in the TeleToets TFS project, execute the following:

1. Open your terminal
2. Go to the directory containing the project that you want to create a repository for
3. Run ```tfstools repo [repository name]```

# Creating a build pipeline
Most (if not all) Front-End components will share the same build pipeline. To get a copy of the correct build pipeline it has to be cloned from TFS.

To clone a build pipeline (using AssessmentPlayer pipeline as leading example) to your repository, execute the following:

1. Open your terminal
2. Run ```tfstools pipeline [repository name]```

# Updating repository policies
Creating a repository with ```tfstools repo [name]``` doesn't automatically set the policies correctly. These policies include among other things the minimum amount of reviewers.

To update the repository policies to the correct ones (using TeleToets.Documentation as leading example):

1. Open your terminal
2. Run ```tfstools policy [repository name]```

# Why

There will be a large number of components that each have a repository but should have one build pipeline. This is however not possible within TFS. Due to this restriction this tool has been created to automate the process of creating a repository and cloning the build pipeline and it's policies. This will aid in the development process by preventing time loss and incorrect build pipelines due to human error. When using tfstools you will have a correctly set-up repository with a correct build-pipeline including the policies and triggers that belong to this repository and pipeline.
