clear all;
m = zeros(1,7);
%files = {'1984-1989.txt','1989-1994.txt','1994-1999.txt','1999-2004.txt','2004-2009.txt'};
files = {'1999-2009-mag4.txt'};
oldday = 0;
n = 0;
record = [];
for i=1:length(files),
    %fid = fopen(files{i});
    %dat = textscan(fid, '%s %u %u %u %f %f %f %u %f %s %s %s ');
    %dat = textscan(fid, '%u %u %u %f %f %f %f %u');
    %days = datenum(double(dat{2}),double(dat{3}),double(dat{4}));
    dat = csvread(files{i});
    days = datenum(dat(:,1),dat(:,2),dat(:,3));
    for j=1:length(days),
        d = weekday(days(j),'local');
        if (d ~= oldday)
            record = [record ; [oldday n]];
            oldday = d;
            n = 0;
        else
            n = n + 1;
        end
        m(d) = m(d)+1;  
    end
end
bar([m(2:end) m(1)]); % move sunday to the end
X2 = sum(((m-sum(m)/7).^2)/(sum(m)/7))
1-chi2cdf(X2,6)