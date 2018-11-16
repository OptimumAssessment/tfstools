## Tfstools

# Install

```npm install -g tfstools```

# First time setup (PAT)

When you run tfstools for the first time you'll have to provide authentication. The authentication comes in the form of your TFS login (3 letter code) and a Personal Access Token (PAT). The 3 letter code is the same code that you use to log into your company laptop. The PAT has to be generated in TFS. To generate a PAT, navigate to [this page](https://tfs.citrus.nl/tfs/Citrus.NET/_details/security/tokens). Once you are on this page, press the 'Add' button to add a new PAT. Give your PAT a name so that you can recognize it later (for example: 'PAT tfstools'). Set the field 'expires in' to 1 year. For the scopes, select 'All scopes'.

When your settings are correct press 'create token' and copy the token. The token will only be visible now, if you navigate away you won't be able to see the token again. You'll have to revoke the token and generate a new one.

Your TFS login (3 letter code) and PAT will be stored in the file '.tfs.login'. This file is located in the users home directory. If you ever need to change your TFS login or PAT (due to it expiring/being revoked etc.) you can either edit the file or delete it and run tfstools again to be prompted to enter your new TFS login and PAT.

**Note: A PAT can be used by someone to identify as you and thus should be treated as a password.**

# Creating a repository

To create a repository with the given name in the Optimum TFS project, execute the following:

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

To update the repository policies to the correct ones (using Optimum.Documentation as leading example):

1. Open your terminal
2. Run ```tfstools policy [repository name]```

# Create a pull request

To create a pull request for the current feature branch.

1. Open your terminal
2. Go to the directory of the git repo, with the correct feature branch selected
3. Run ```tfstools pr```

# Sync tfs vars

To fill __VARIABLE__ placeholders with values of a variable group in TFS
1. Open your terminal
2. Go to the directory of the git repo
3. Run ```tfstools syncvars [vargroup name]```
4. Work with the synchronized values
5. Before pushing to remote, a pre-push hook "forces" you to ```tfstools unsyncvars``` first


# Why

There will be a large number of components that each have a repository but should have one build pipeline. This is however not possible within TFS. Due to this restriction this tool has been created to automate the process of creating a repository and cloning the build pipeline and it's policies. This will aid in the development process by preventing time loss and incorrect build pipelines due to human error. When using tfstools you will have a correctly set-up repository with a correct build-pipeline including the policies and triggers that belong to this repository and pipeline.

# Test

1. ```npm install```
2. ```jest```



