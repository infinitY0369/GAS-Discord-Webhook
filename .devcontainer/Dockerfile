FROM library/node:slim

RUN apt update && apt upgrade -y && apt full-upgrade -y
RUN apt install curl git unzip -y
RUN apt autoclean && apt autoremove

# Persist bash history (https://code.visualstudio.com/remote/advancedcontainers/persist-bash-history)
RUN echo "\nexport PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" >> ~/.bashrc

# Loading from the global folders (https://nodejs.org/api/modules.html#loading-from-node_modules-folders)
RUN echo "export NODE_PATH=$(npm root -g)" >> ~/.bashrc

# Install Oh My Posh (https://github.com/jandedobbeleer/oh-my-posh)
RUN curl -s https://ohmyposh.dev/install.sh | bash -s
RUN echo '\neval "$(oh-my-posh init bash --config https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/clean-detailed.omp.json)"' >> ~/.bashrc

# Install npm packages globally
RUN npm install -g \
    @google/clasp \
    @types/google-apps-script \
    @typescript-eslint/eslint-plugin \
    @typescript-eslint/parser \
    esbuild \
    esbuild-gas-plugin \
    eslint \
    eslint-config-standard-with-typescript \
    eslint-plugin-import \
    eslint-plugin-n \
    eslint-plugin-promise \
    fast-xml-parser \
    typescript

# Update globally installed npm packages
RUN npm update -g
