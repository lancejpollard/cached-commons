module CachedCommons
  class Spec
    def initialize(&block)
      apply CachedCommons::Spec::Definition.new(&block)
    end
    
    def apply(definition)
      definition.attributes.each do |key, value|
        self.send("#{key}=", value)
      end
    end
    
    def title(value = nil)
      @title = value if value
      @title
    end
    
    def home(value = nil)
      @home = value if value
      @home
    end
    
    def description(value = nil)
      @description = value if value
      @description
    end
    
    def tags(value = nil)
      @tags = value if value
      @tags
    end
    
    def author(value = nil)
      @author = value if value
      @author
    end
    
    def version(value = nil)
      @version = value if value
      @version
    end
    
    def repository(value = nil)
      @repository = value if value
      @repository
    end
    
    def demos(value = nil)
      @demos = value if value
      @demos
    end
    
    def docs(value = nil)
      @docs = value if value
      @docs
    end
    
    class Definition
      attr_accessor :attributes
      
      def initialize(&block)
        self.attributes = {}
        instance_eval(&block)
      end
      
      def method_missing(method, *args, &block)
        self.attributes[method.to_sym] = *args
      end
    end
  end
end
