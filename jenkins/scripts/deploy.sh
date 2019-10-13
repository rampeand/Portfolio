echo -e "\e[31mStopping Portfolio docker container\e[0m"
docker stop portfolio
echo -e "\e[31mRemoving Portfolio docker container\e[0m"
docker rm portfolio
echo -e "\e[31mRemoving Docker image\e[0m"
docker rmi portfolio_image
echo -e "\e[31mRebuilding Portfolio docker image\e[0m"
docker build -t portfolio_image .
echo -e "\e[31mDeploying Portfolio docker container\e[0m"
docker run --name portfolio -d -p 80:80 portfolio_image
echo -e "\e[31mVerigying Portfolio docker container has been successfully deployed\e[0m"
docker ps
