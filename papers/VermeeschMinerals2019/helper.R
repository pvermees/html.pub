# add a 'confidence polygon' to an existing ternary diagram
ternary.polygon <- function(LL,UL,...){
    min.a <- LL[1]
    max.a <- UL[1]
    min.b <- LL[2]
    max.b <- UL[2]
    min.c <- LL[3]
    max.c <- UL[3]
    corners <- matrix(c(max.a,min.b,1-max.a-min.b,
                        max.a,1-max.a-min.c,min.c,
                        1-max.b-min.c,max.b,min.c,
                        min.a,max.b,1-min.a-max.b,
                        min.a,1-min.a-max.c,max.c,
                        1-min.b-max.c,min.b,max.c,
                        max.a,min.b,1-max.a-min.b),
                      byrow=TRUE,ncol=3)
    polygon <- provenance:::xyz2xy(corners)
    i <- chull(polygon)
    lines(polygon[c(i,i[1]),],...)
}

# 4-panel summary plot for 2D principal component analysis
# X = a 2-column table of numerical values
PCA2D <- function(X){
    pc <- prcomp(X)
    # calculate the end-points of two lines marking the principal components (PC):
    CL <- matrix(NA,4,2) # initialise the matrix of coordinates
    CL[1:2,] <- matrix(1,2,1) %*% pc$center + diag(pc$sdev) %*% t(pc$rotation)
    CL[3:4,] <- matrix(1,2,1) %*% pc$center - diag(pc$sdev) %*% t(pc$rotation)
    # set up the 4-panel plot:
    par(mfrow=c(2,2),mar=c(5,5,1,1),xpd=TRUE)
    # initialise the 1st panel:
    rx <- range(X[,'a'],CL[,1]) # range of x-values
    ry <- range(X[,'b'],CL[,2]) # range of y-values
    plot(rx,ry,type='n',asp=1,xlab='a',ylab='b')
    mtext('i',side=3,line=-1,adj=0.99)
    text(X,labels=1:3)
    # draw the line marking the 1st PC:
    lines(CL[c(1,3),])
    text(CL[3,1],CL[3,2],labels='PC1',pos=4)
    # draw the line marking the 2nd PC:
    lines(CL[c(2,4),])
    text(CL[2,1],CL[2,2],labels='PC2',pos=4)
    # add the centre point as a yellow square:
    points(t(pc$center),pch=22,bg='yellow')
    # initialise the 2nd panel:
    plot(range(pc$x),c(1,4),type='n',bty='n',
         xaxt='n',yaxt='n',xlab='',ylab='')
    mtext('ii',side=3,line=-1,adj=0.99)
    Axis(side=1)
    # plot the 1st PC scores as a 1D configuration:
    lines(pc$x[,'PC1'],rep(2,3))
    points(pc$x[,'PC1'],rep(2,3))
    text(pc$x[,'PC1'],rep(2,3),labels=1:3,pos=c(1,1,3))
    text(min(pc$x[,'PC1']),2,labels='PC1',pos=2)
    # plot the 2nd PC scores as a 1D configuration:
    lines(pc$x[,'PC2'],rep(3,3))
    points(pc$x[,'PC2'],rep(3,3))
    text(pc$x[,'PC2'],rep(3,3),labels=1:3,pos=1)
    text(min(pc$x[,'PC2']),3,labels='PC2',pos=2)
    # plot both PCA scores and the loadings in the 3rd panel:
    biplot(pc)
    mtext('iii',side=3,line=-1,adj=0.99)
    # plot the weights of the PCs in the 4th panel:
    w <- pc$sdev^2
    names(w) <- colnames(pc$x)
    barplot(w)
    mtext('iv',side=3,line=-1,adj=0.99)
}
